import Router from 'koa-router';
import {VERSION_PREFIX} from '../utils/version.util';
import {initState} from '../utils/state.util';
import {authenticate} from '../components/Identityprovider/identityprovider.component';
import {getTicket} from '../components/Ticket/ticket.component';

const router = new Router({prefix: VERSION_PREFIX + '/getTicket'});

router.get('/:token/:id', initState, authenticate, getTicket);

export default router;
