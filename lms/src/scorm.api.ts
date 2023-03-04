/**
 * scorm documentation
 * https://scorm.com/scorm-explained/technical-scorm/run-time/run-time-reference/
 * https://scorm.com/scorm-explained/technical-scorm/sequencing/sequencing-definition-model/
 */

export interface ICourseData {
  course_identifier: string;
  resource_identifier: string;
}

export enum EScormError {
  'No Error' = 0,
  'General Exception' = 101,
  'General Initialization Failure' = 102,
  'Already Initialized' = 103,
  'Content Instance Terminated' = 104,
  'General Termination Failure' = 111,
  'Termination Before Initialization' = 112,
  'Termination After Termination' = 113,
  'Retrieve Data Before Initialization' = 122,
  'Retrieve Data After Termination' = 123,
  'Store Data Before Initialization' = 132,
  'Store Data After Termination' = 133,
  'Commit Before Initialization' = 142,
  'Commit After Termination' = 143,
  'General Argument Error' = 201,
  'General Get Failure' = 301,
  'General Set Failure' = 351,
  'General Commit Failure' = 391,
  'Undefined Data Model Element' = 401,
  'Unimplemented Data Model Element' = 402,
  'Data Model Element Value Not Initialized' = 403,
  'Data Model Element Is Read Only' = 404,
  'Data Model Element Is Write Only' = 405,
  'Data Model Element Type Mismatch' = 406,
  'Data Model Element Value Out Of Range' = 407,
  'Data Model Dependency Not Established' = 408,
}

export class ScormCourse {
  public version = '1.0';
  public initialized = false;
  public last_error = EScormError["No Error"];
  public values: Record<string, string | number> = {};

  public user_id: string;
  public course_id: string;
  public course_data: ICourseData;
  public resources_identifiers: string[];
  public scorm_next_resource: string | null = null;

  public start_timestamp = new Date();
  public lrs_url: string = import.meta.env.VITE_APP_API;

  constructor(
    lrs_path: string,
    data: {
      user_id: string;
      course_id: string;
    },
    course_data: ICourseData,
    resources_identifiers: string[],
  ) {
    this.lrs_url = this.lrs_url + lrs_path;
    this.user_id = data.user_id;
    this.course_id = data.course_id;
    this.course_data = course_data;
    this.resources_identifiers = resources_identifiers;
  }

  public Initialize(params: unknown) {
    if (params) {
      this.last_error = EScormError["General Argument Error"];

      return 'false';
    }

    if (this.initialized) {
      this.last_error = EScormError["Already Initialized"];

      return 'false';
    }

    this.initialized = true;
    this.last_error = EScormError["No Error"];

    localStorage.setItem(`${this.course_id}_scorm_next_resource`, '');

    return 'true';
  }

  public GetValue(variable: string) {
    if (!this.initialized) {
      this.last_error = EScormError["Retrieve Data Before Initialization"];

      return '';
    }

    if (!variable?.length) {
      this.last_error = EScormError["Undefined Data Model Element"];

      return '';
    }

    this.last_error = EScormError["No Error"];

    let value = this.navigation_requests_value(variable);

    if (value) {
      return value;
    }

    value = this.values[variable]; 

    if (!value ) {
      try {
        value = this.sendRequest('/get_value', { variable: variable, ...this.baseData() })?.value;
      } catch (error) {
        this.last_error = EScormError["General Get Failure"];

        value = '';
      }
    }

    if (value === '') {
      this.last_error = EScormError["Data Model Element Value Not Initialized"];
    }

    return value;
  }

  private navigation_requests_value(variable: string): string | number | null {
    const current_resource_position = this.resources_identifiers.findIndex((i) => i === this.course_data.resource_identifier);

    if (variable == "adl.nav.request_valid.continue") {
      if (this.resources_identifiers[current_resource_position + 1] != null) {
        return 'true'
      } else {
        return 'false'
      }
    }

    if (variable == "adl.nav.request_valid.previous") {
      if (current_resource_position > 0) {
        return 'true'
      } else {
        return 'false'
      }
    }

    const variable_regexp = new RegExp('adl.nav.request_valid.choice.{target=.*}');

    if (variable.match(variable_regexp)) {
      const target_regexp = new RegExp('{.*}');
      const target_result = target_regexp.exec(variable);

      if (target_result) {
        const target = target_result[0];
        const identifier = target.slice(8, target.length - 1);

        if (this.resources_identifiers.findIndex((i) => i === identifier) !== -1) {
          return 'true'
        } else {
          return 'false'
        }
      }
    }

    return null;
  }

  public SetValue(variable: string, value: string | number) {
    if (!this.initialized) {
      this.last_error = EScormError["Store Data Before Initialization"];

      return 'false';
    }

    if (!variable?.length) {
      this.last_error = EScormError["Undefined Data Model Element"];

      return 'false';
    }

    if (!this.validate_set_variable(variable, value)) {
      return 'false';
    }

    this.values[variable] = value;
    this.last_error = EScormError["No Error"];

    try {
      this.sendRequest('/set_value', { variable, value, ...this.baseData() })
    } catch (error) {
      this.last_error = EScormError["General Set Failure"];

      return 'false';
    }

    return 'true';
  }

  private validate_set_variable(variable: string, value: string | number) {
    const objective_id_regexp = new RegExp('cmi.objectives.[0-9]*.id');

    if (variable.match(objective_id_regexp)) {
      let objective_id: string;

      try {
        objective_id = this.sendRequest('/get_value', { variable, ...this.baseData() })?.value
      } catch (error) {
        this.last_error = EScormError["General Get Failure"];

        return false;
      }

      if (objective_id?.length && objective_id !== value) {
        this.last_error = EScormError["General Set Failure"];

        return false;
      } else {
        this.last_error = EScormError["No Error"];

        return true;
      }
    }

    const completion_statuses: string[] = ['completed', 'incomplete', 'not attempted', 'unknown'];
    const objective_completion_status_regexp = new RegExp('cmi.objectives.[0-9]*.completion_status');

    if (variable === 'cmi.completion_status' || variable.match(objective_completion_status_regexp)) {
      if (completion_statuses.includes(value as string)) {
        this.last_error = EScormError["No Error"];

        return true
      } else {
        this.last_error = EScormError["Data Model Element Type Mismatch"];

        return false;
      }
    }

    this.last_error = EScormError["No Error"];

    return true;
  }

  public Terminate(params: unknown) {
    if (params) {
      this.last_error = EScormError["General Argument Error"];

      return 'false';
    }

    if (!this.initialized) {
      this.last_error = EScormError["Termination Before Initialization"];

      return 'false';
    }

    this.initialized = false;
    this.last_error = EScormError["No Error"];

    try {
      this.sendRequest('/terminate', this.baseData())
    } catch (error) {
      this.last_error = EScormError["General Commit Failure"]

      return 'false'
    }

    this.navigation_requests_redirect()

    return 'true';
  }

  private navigation_requests_redirect() {
    const value = this.values['adl.nav.request'] as string;

    if (!value) {
      this.scorm_next_resource = '';

      return;
    }

    const current_resource_position = this.resources_identifiers.findIndex((i) => i === this.course_data.resource_identifier);

    if (value === 'continue') {
      this.scorm_next_resource = this.resources_identifiers[current_resource_position + 1]
    }

    if (value === 'previous') {
      this.scorm_next_resource = this.resources_identifiers[current_resource_position - 1]
    }

    const jump_regexp = new RegExp('{target=.*}jump');

    if (value.match(jump_regexp)) {
      const target_regexp = new RegExp('{.*}');
      const target_result = target_regexp.exec(value);

      if (target_result) {
        const target = target_result[0];
        const identifier = target.slice(8, target.length - 1);

        if (this.resources_identifiers.findIndex((i) => i === identifier) !== -1) {
          this.scorm_next_resource = identifier
        }
      }
    }

  }

  public Commit(params: unknown) {
    if (params) {
      this.last_error = EScormError["General Argument Error"];

      return 'false';
    }

    if (!this.initialized) {
      this.last_error = EScormError["Commit Before Initialization"];

      return 'false';
    }

    this.last_error = EScormError["No Error"];

    return 'true';
  }

  public GetLastError() {
    return this.last_error;
  }

  public GetErrorString(error_code: number) {
    return EScormError[error_code];
  }

  public GetDiagnostic(error_code: number) {
    return EScormError[error_code];
  }

  private baseData() {
    return {
      user_id: this.user_id,
      course_id: this.course_id,
     ...this.course_data, 
    }
  }

  private sendRequest(path: string, data: Record<string, unknown>) {
    data.scorm_type = this.constructor.name

    try {
      const xhr = new XMLHttpRequest();
      const json = JSON.stringify(data);

      xhr.open('POST', this.lrs_url + path, false);
      xhr.setRequestHeader('Content-type', 'application/json; charset=utf-8');
      xhr.send(json);

      return JSON.parse(xhr.response);
    } catch (error) {
      console.error(error);

      throw error;
    }
  }
}

export class API_1484_11 extends ScormCourse {
  public version: string = '2004';

  constructor(
    lrs_path: string,
    data: {
      user_id: string;
      course_id: string;
    },
    course_data: ICourseData,
    resources_identifiers: string[]
  ) {
    super(lrs_path, data, course_data, resources_identifiers);
  }
}

export class API extends ScormCourse {
  public version: string = '1.0';

  public LMSInitialize = this.Initialize;
  public LMSFinish = this.Terminate;
  public LMSGetValue = this.GetValue;
  public LMSSetValue = this.SetValue;
  public LMSCommit = this.Commit;
  public LMSGetLastError = this.GetLastError;
  public LMSGetErrorString = this.GetErrorString;
  public LMSGetDiagnostic = this.GetDiagnostic;

  constructor(
    lrs_path: string,
    data: {
      user_id: string;
      course_id: string;
    },
    course_data: ICourseData,
    resources_identifiers: string[],
  ) {
    super(lrs_path, data, course_data, resources_identifiers);
  }
}
