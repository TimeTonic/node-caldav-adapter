import { CalendarContext } from '../koa';
import { CalDavEvent } from '..';

const setAllowHeader = function(ctx: CalendarContext, methods: string[]) {
  ctx.set('Allow', methods.join(', '));
};

const setDAVHeader = function(ctx: CalendarContext) {
  ctx.set('DAV', [
    '1',
    // '2',
    '3',
    // 'extended-mkcol',
    'calendar-access',
    'calendar-schedule',
    // 'calendar-auto-schedule',
    /* https://github.com/apple/ccs-calendarserver/blob/master/doc/Extensions/caldav-proxy.txt */
    // 'calendar-proxy',
    // 'calendarserver-sharing',
    // 'calendarserver-subscribed',
    // 'access-control',
    /* https://tools.ietf.org/html/rfc3744#section-9.4 */
    // 'calendarserver-principal-property-search'
  ].join(', '));
};

const setXMLHeader = function(ctx: CalendarContext) {
  ctx.set('Content-Type', 'application/xml; charset="utf-8"');
};

/* https://tools.ietf.org/html/rfc4791#section-5.1.1 */
export const setOptions = function(ctx: CalendarContext, methods: string[]) {
  ctx.status = 200;
  setAllowHeader(ctx, methods);
  setDAVHeader(ctx);
  ctx.body = '';
};

export const setOkResponse = function(ctx: CalendarContext) {
  ctx.status = 200;
};

/* https://tools.ietf.org/html/rfc4791#section-7.8.1 */
export const setMultistatusResponse = function(ctx: CalendarContext) {
  ctx.status = 207;
  setDAVHeader(ctx);
  setXMLHeader(ctx);
};

/* https://tools.ietf.org/html/rfc4791#section-5.3.2 */
export const setEventPutResponse = function(ctx: CalendarContext, event: CalDavEvent) {
  ctx.status = 201;
  ctx.set('ETag', event.lastModifiedOn);
};

export const setMissingMethod = function(ctx: CalendarContext) {
  ctx.status = 404;
  ctx.set('Content-Type', 'text/html; charset="utf-8"');
};
