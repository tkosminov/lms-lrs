export interface ICommonData {
  course_identifier: string;
  resource_identifier: string;
}

export class ScormCourse {
  public values: Record<string, string> = {};
  public version = '1.0';
  private readonly skip_datamodel_error: string[] = ['cmi.core.lesson_location', 'cmi.location'];

  public last_error = 0;
  public initialized = false;

  public user_id: string;
  public course_id: string;

  public start_timestamp = new Date();

  // public previous_url: string;
  // public continue_url: string;
  // public jump_urls: string[];

  public lrs_url: string = import.meta.env.VITE_APP_API;

  public common_data: ICommonData;

  constructor(data: { user_id: string, course_id: string }, lrs_path: string, common_data: ICommonData) {
    this.user_id = data.user_id;
    this.course_id = data.course_id;

    this.lrs_url = this.lrs_url + lrs_path;
    this.common_data = common_data;
  }

  public Initialize(params: unknown) {
    if (params) {
      this.last_error = 201;
      return 'false';
    }

    if (this.initialized) {
      this.last_error = 103;
      return 'false';
    }

    this.initialized = true;
    this.last_error = 0;

    return 'true';
  }

  public Terminate(params: unknown) {
    if (params) {
      this.last_error = 201;
      return 'false';
    }

    if (!this.initialized) {
      this.last_error = 301;
      return 'false';
    }

    this.initialized = false;
    this.last_error = 0;

    try {
      this.sendRequest(`${this.lrs_url}/terminate`, { ...this.common_data, user_id: this.user_id, course_id: this.course_id });
    } catch (e) {
      return 'false';
    }

    // this.check_redirect_conditions(this.values);

    return 'true';
  }

  // public check_redirect_conditions(values) {
  //   let url = null;
  //   const request = values['adl.nav.request'];
  //   if (request == null) {
  //     return;
  //   }
  //
  //   if (request === 'continue') {
  //     url = this.continue_url;
  //   }
  //
  //   if (request === 'previous') {
  //     url = this.previous_url;
  //   }
  //
  //   let re = new RegExp('{target=.*}jump');
  //   if (request.match(re)) {
  //     re = new RegExp('{.*}');
  //     const m = re.exec(request);
  //     let identifier = m[0];
  //     identifier = identifier.substr(8, identifier.length - 9);
  //     url = this.jump_urls[identifier];
  //   }
  //
  //   if (url) {
  //     window.location = url;
  //   }
  // }

  public GetValue(variable: string) {
    if (!this.initialized) {
      this.last_error = 122;
      this.last_error = 301;
      return '';
    }

    if (variable === '') {
      this.last_error = 301;
      return '';
    }

    this.last_error = 0;

    // let value = this.check_for_special_requests(variable);
    // if (value) {
    //   return value;
    // }

    let value = this.values[variable];

    if (!value) {
      try {
        value = this.sendRequest(`${this.lrs_url}/get_value`, { ...this.common_data, variable: variable, user_id: this.user_id, course_id: this.course_id })?.value;
      } catch (e) {
        value = '';
      }
    }

    if (value === '' && !this.skip_datamodel_error.includes(variable)) {
      this.last_error = 403;
    }

    return value;
  }

  // public check_for_special_requests(variable) {
  //   if (variable === 'adl.nav.request_valid.continue') {
  //     if (this.continue_url != null) {
  //       return 'true';
  //     } else {
  //       return 'false';
  //     }
  //   }
  //
  //   if (variable === 'adl.nav.request_valid.previous') {
  //     if (this.previous_url != null) {
  //       return 'true';
  //     } else {
  //       return 'false';
  //     }
  //   }
  //
  //   let re = new RegExp('adl.nav.request_valid.choice.{target=.*}');
  //   if (variable.match(re)) {
  //     re = new RegExp('{.*}');
  //     const m = re.exec(variable);
  //     let identifier = m[0];
  //     identifier = identifier.substr(8, identifier.length - 9);
  //
  //     if (this.jump_urls[identifier] != null) {
  //       return 'true';
  //     } else {
  //       return 'false';
  //     }
  //   }
  // }

  public SetValue(variable: string, value: string) {
    if (!this.initialized) {
      this.last_error = 132;
      this.last_error = 301;
      return 'false';
    }

    if (variable === '') {
      this.last_error = 351;
      return 'false';
    }

    if (!this.validate_set_variable(variable, value)) {
      return 'false';
    }

    this.values[variable] = value;
    this.last_error = 0;

    let response;
    try {
      response = this.sendRequest(`${this.lrs_url}/set_value`, { ...this.common_data, variable: variable, value: value, user_id: this.user_id, course_id: this.course_id }, 'text');
    } catch (e) {
      return 'false';
    }

    if (response.substr(0, 5) === 'error') {
      this.last_error = parseInt(response.substr(6, response.length - 6), 10);
      return 'false';
    }

    return 'true';
  }

  public validate_set_variable(variable: string, value: string) {
    const re = new RegExp('cmi.objectives.[0-9]*.id');
    if (variable.match(re)) {
      let existing_value;
      try {
        existing_value = this.sendRequest(`${this.lrs_url}/get_value`, { ...this.common_data, variable: variable, user_id: this.user_id, course_id: this.course_id })?.value;
      } catch (e) {
        return false;
      }
      if (existing_value.length !== 0 && existing_value !== value) {
        this.last_error = 351;
        return false;
      } else {
        return true;
      }
    }

    if (variable === 'cmi.completion_status') {
      const possible_values = ['incomplete', 'completed', 'not attempted', 'unknown'];
      if (!possible_values.includes(value)) {
        this.last_error = 406;
        return false;
      }
    }

    return true;
  }

  public sendRequest(url: string, data: any, type = 'json') {
    try {
      const xhr = new XMLHttpRequest();
      const json = JSON.stringify(data);

      xhr.open('POST', url, false);
      xhr.setRequestHeader('Content-type', 'application/json; charset=utf-8');
      xhr.send(json);

      // TODO: возможно придется потом убрать, terminate пока ничего не возвращает
      if (!xhr.response) {
        return;
      }

      return type === 'json' ? JSON.parse(xhr.response) : xhr.response;
    } catch (e) {
      // eslint-disable-next-line no-console
      console.log(e);
      throw e;
    }
  }

  // public fetchRequest(url, body_data) {
  //   const options = {
  //     method: 'POST',
  //     headers: {
  //       'Content-Type': 'application/json',
  //       Authorization: this.authorization,
  //     },
  //     body: JSON.stringify(body_data),
  //   };
  //   return fetch(url, options)
  //     .then((response) => response.json())
  //     .then((data) => data)
  //     .catch((e) => {
  //       // eslint-disable-next-line no-console
  //       console.log(e);
  //     });
  // }

  public Commit(params: string) {
    if (params) {
      this.last_error = 201;
      return 'false';
    }

    if (!this.initialized) {
      this.last_error = 142;
      this.last_error = 301;
      return 'false';
    }

    this.last_error = 0;

    return 'true';
  }

  public GetLastError() {
    return this.last_error;
  }

  // @ts-ignore
  public GetErrorString(error_code) {
    return '';
  }

  public GetDiagnostic() {
    return '';
  }

  public get session_time() {
    return ConvertMilliSecondsToSCORMTime(new Date().getTime() - this.start_timestamp.getTime(), false);
  }
}

export class API_1484_11 extends ScormCourse {
  // public values = [];
  // public version: '1.0';

  constructor(data: { user_id: string, course_id: string }, lrs_path: string, common_data: ICommonData) {
    super(data, lrs_path, common_data);
  }
}

export class API extends ScormCourse {
  public LMSInitialize = this.Initialize;
  public LMSFinish = this.Terminate;
  public LMSGetValue = this.GetValue;
  public LMSSetValue = this.SetValue;
  public LMSCommit = this.Commit;
  public LMSGetLastError = this.GetLastError;
  public LMSGetErrorString = this.GetErrorString;
  public LMSGetDiagnostic = this.GetDiagnostic;
  // public values = [];
  // public version = '1.0';

  constructor(data: { user_id: string, course_id: string }, lrs_path: string, common_data: ICommonData) {
    super(data, lrs_path, common_data);
  }
}

//SCORM requires time to be formatted in a specific way
export function ConvertMilliSecondsToSCORMTime(intTotalMilliseconds: number, blnIncludeFraction: boolean) {
  if (blnIncludeFraction == null) {
    blnIncludeFraction = true;
  }

  //extract time parts
  let intMilliseconds = intTotalMilliseconds % 1000;

  let intSeconds = ((intTotalMilliseconds - intMilliseconds) / 1000) % 60;

  let intMinutes = ((intTotalMilliseconds - intMilliseconds - intSeconds * 1000) / 60000) % 60;

  let intHours = (intTotalMilliseconds - intMilliseconds - intSeconds * 1000 - intMinutes * 60000) / 3600000;

  /*
  deal with exceptional case when content used a huge amount of time and interpreted CMITimstamp
  to allow a number of intMinutes and seconds greater than 60 i.e. 9999:99:99.99 instead of 9999:60:60:99
  note - this case is permissable under SCORM, but will be exceptionally rare
  */

  if (intHours === 10000) {
    intHours = 9999;

    intMinutes = (intTotalMilliseconds - intHours * 3600000) / 60000;
    if (intMinutes === 100) {
      intMinutes = 99;
    }
    intMinutes = Math.floor(intMinutes);

    intSeconds = (intTotalMilliseconds - intHours * 3600000 - intMinutes * 60000) / 1000;
    if (intSeconds === 100) {
      intSeconds = 99;
    }
    intSeconds = Math.floor(intSeconds);

    intMilliseconds = intTotalMilliseconds - intHours * 3600000 - intMinutes * 60000 - intSeconds * 1000;
  }

  //drop the extra precision from the milliseconds
  const intHundredths = Math.floor(intMilliseconds / 10);

  //put in padding 0's and concatinate to get the proper format
  let strCMITimeSpan = ZeroPad(intHours, 4) + ':' + ZeroPad(intMinutes, 2) + ':' + ZeroPad(intSeconds, 2);

  if (blnIncludeFraction) {
    strCMITimeSpan += '.' + intHundredths;
  }

  //check for case where total milliseconds is greater than max supported by strCMITimeSpan
  if (intHours > 9999) {
    strCMITimeSpan = '9999:99:99';

    if (blnIncludeFraction) {
      strCMITimeSpan += '.99';
    }
  }

  return strCMITimeSpan;
}

function ZeroPad(intNum: number, intNumDigits: number) {
  let strTemp = String(intNum);
  const intLen = strTemp.length;

  if (intLen > intNumDigits) {
    strTemp = strTemp.substr(0, intNumDigits);
  } else {
    for (let i = intLen; i < intNumDigits; i++) {
      strTemp = '0' + strTemp;
    }
  }

  return strTemp;
}
