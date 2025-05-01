export class ApiDebugger {
	private readonly nonProdEnv = ['development', 'test', 'dev', 'local', 'qa'];
	private readonly environment: string;
	constructor(environment: string) {
		this.environment = environment || process.env.NODE_ENV;
	}

	debug = (message?: unknown, ...optionalParams: unknown[]) => {
		if (this.nonProdEnv.includes(this.environment)) {
			console.debug(message, ...optionalParams);
		}
	};

	error = (message?: unknown, ...optionalParams: unknown[]) => {
		if (this.nonProdEnv.includes(this.environment)) {
			console.error(message, ...optionalParams);
		}
	};

	info = (message?: unknown, ...optionalParams: unknown[]) => {
		if (this.nonProdEnv.includes(this.environment)) {
			console.info(message, ...optionalParams);
		}
	};

	log = (message?: unknown, ...optionalParams: unknown[]) => {
		if (this.nonProdEnv.includes(this.environment)) {
			console.log(message, ...optionalParams);
		}
	};

	tabulate = (optionalParams: unknown) => {
		if (this.nonProdEnv.includes(this.environment)) {
			console.table(optionalParams);
		}
	};

	warn = (message?: unknown, ...optionalParams: unknown[]) => {
		if (this.nonProdEnv.includes(this.environment)) {
			console.warn(message, ...optionalParams);
		}
	};
}
