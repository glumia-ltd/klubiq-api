// This module is used to provide global services and helpers to the application.
// It is imported in the KlubiqDashboardModule and used in the controllers and services.
// We can use it to provide services like Debugger, Generators, etc.
import { Global, Module } from '@nestjs/common';
import { ApiDebugger } from './helpers/debug-loggers';
import { Generators } from './helpers/generators';
import { Util } from './helpers/util';

@Global()
@Module({
	providers: [ApiDebugger, Generators, Util],
	exports: [ApiDebugger, Generators, Util],
})
export class CommonModule {}
