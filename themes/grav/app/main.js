// polyfills
import '@babel/polyfill';

import $ from 'jquery';
import './utils/remodal';
import 'simplebar';
import GPM, { Instance as gpm } from './utils/gpm';
import KeepAlive from './utils/keepalive';
import Updates, { Instance as updates, Notifications, Feed } from './updates';
import Dashboard from './dashboard';
import Pages from './pages';
import Forms from './forms';
import Cookies from './utils/cookies';
import './plugins';
import './themes';
import MediaFilter, { Instance as MediaFilterInstance} from './media';
import toastr from './utils/toastr';
import request from './utils/request';
import './utils/2fa';
import './tools';
import './whitelabel';

// bootstrap jQuery extensions
import './utils/bootstrap-transition';
import './utils/bootstrap-collapse';
import './utils/bootstrap-dropdown';

// tabs memory
import './utils/tabs-memory';

// changelog
import './utils/changelog';

// Main Sidebar
import Sidebar, { Instance as sidebar } from './utils/sidebar';

// starts the keep alive, auto runs every X seconds
KeepAlive.start();

// global event to catch sidebar_state changes
$(global).on('sidebar_state._grav', () => {
    Object.keys(Dashboard.Chart.Instances).forEach((chart) => {
        setTimeout(() => Dashboard.Chart.Instances[chart].chart.update(), 10);
    });
});

export default {
    GPM: {
        GPM,
        Instance: gpm
    },
    KeepAlive,
    Dashboard,
    Pages,
    Forms,
    Updates: {
        Updates,
        Notifications,
        Feed,
        Instance: updates
    },
    Sidebar: {
        Sidebar,
        Instance: sidebar
    },
    MediaFilter: {
        MediaFilter,
        Instance: MediaFilterInstance
    },
    Scrollbar: { Scrollbar: { deprecated: true }, Instance: { deprecated: true } },
    Utils: { request, toastr, Cookies }
};
