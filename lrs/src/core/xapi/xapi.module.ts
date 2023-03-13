import { Module } from '@nestjs/common';

import { XapiActivityModule } from './activity/activity.module';
import { XapiStateModule } from './state/state.module';
import { XapiStatementModule } from './statement/statement.module';
import { XapiVerbModule } from './verb/verb.module';

@Module({
  imports: [XapiActivityModule, XapiStateModule, XapiStatementModule, XapiVerbModule],
  providers: [],
  controllers: [],
  exports: [XapiActivityModule, XapiStateModule, XapiStatementModule, XapiVerbModule],
})
export class XapiModule {}
