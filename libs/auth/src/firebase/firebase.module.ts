import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { FirebaseAdminService } from './firebase-admin.service';

@Module({
  providers: [FirebaseAdminService],
  exports: [FirebaseAdminService],
})
export class FirebaseModule {
  constructor(private readonly configService: ConfigService) {}

  static forRoot(): any {
    return {
      module: FirebaseModule,
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
        }),
      ],
    };
  }
}
