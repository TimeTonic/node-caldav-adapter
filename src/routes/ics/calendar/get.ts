import { setMissingMethod } from '../../../common/response';
import winston from '../../../common/winston';
import eventBuild from '../../../common/eventBuild';
import { CalDavOptionsModule, CalDavCalendar } from '../../..';
import { CalendarContext } from '../../../koa';

export default function(opts: CalDavOptionsModule) {
  const log = winston({ ...opts, label: 'calendar/get' });
  const { buildICS } = eventBuild(opts);
  
  const exec = async function(ctx: CalendarContext, calendar: CalDavCalendar) {
    const events = await opts.data.getEventsForCalendar({
      principalId: ctx.state.params.principalId,
      calendarId: ctx.state.params.calendarId,
      user: ctx.state.user,
      fullData: true
    });
    if (!events) {
      log.debug(`calendar ${ctx.state.params.calendarId} not found`);
      return setMissingMethod(ctx);
    }
    return buildICS(events, calendar);
  };
  
  return {
    exec
  };
}
