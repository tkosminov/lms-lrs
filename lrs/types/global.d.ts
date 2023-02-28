interface IAppSettings {
  readonly port: number;
  readonly body_limit: string;
  readonly body_parameter_limit: number;
}

interface ICorsSettings {
  readonly allowed_origins: string[];
  readonly allowed_paths: string[];
  readonly allowed_methods: string[];
  readonly allowed_credentials: boolean;
  readonly allowed_headers: string[];
}

interface ILogSettings {
  readonly level: string;
  readonly silence: string[];
}

interface IJwtSettings {
  readonly secret_key: string;
  readonly algorithm: string;
  readonly access_token_expires_in: number;
  readonly refresh_token_expires_in: number;
}

interface IGuard {
  readonly username: string;
  readonly password: string;
}
