import { notFound } from '../../common/xBuild';
import { setOkResponse, setOptions } from '../../common/response';
import winston from '../../common/winston';
import { CalDavOptionsModule } from '../..';
import { CalendarContext } from '../../koa';

import routerCalGet from './calendar/get';

export default function(opts: CalDavOptionsModule) {
  const log = winston({ ...opts, label: 'ics' });
  const calMethods = {
    get: routerCalGet(opts),
  };

  return async function(ctx: CalendarContext) {
    const method = ctx.method.toLowerCase();
    const calendarId = ctx.state.params.calendarId;
    setOkResponse(ctx);
    
    if (!calendarId) {
      if (method === 'options') {
        setOptions(ctx, ['OPTIONS', 'PROPFIND']);
        return;
      } else {
        log.warn('calendar id missing');
        ctx.body = notFound(ctx.url);
        return;
      }
    } else {
      // check calendar exists & user has access
      const calendar = await opts.data.getCalendar({
        principalId: ctx.state.params.principalId,
        calendarId: calendarId,
        user: ctx.state.user
      });
      if (method === 'options') {
        const methods = calendar && calendar.readOnly ?
          ['GET', 'OPTIONS', 'PROPFIND', 'REPORT'] :
          ['GET', 'OPTIONS', 'PROPFIND', 'REPORT', 'PUT', 'DELETE'];
        setOptions(ctx, methods);
        return;
      }
      if (!calendar) {
        log.warn(`calendar not found: ${calendarId}`);
        ctx.body = notFound(ctx.url);
        return;
      }
      if (!calMethods[method]) {
        log.warn(`method handler not found: ${method}`);
        ctx.body = notFound(ctx.url);
        return;
      }
      const body = await calMethods[method].exec(ctx, calendar);
      if (body) {
        ctx.body = body;
      }
    }
  };
}
