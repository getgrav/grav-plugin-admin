import GPM, { Instance as gpm } from './utils/gpm';
import KeepAlive from './utils/keepalive';
import Updates, { Instance as updates } from './updates';
import Dashboard from './dashboard';
import Pages from './pages';
import Forms from './forms';
import Scrollbar from './utils/scrollbar';
import './plugins';
import './themes';

// bootstrap jQuery extensions
import 'bootstrap/js/transition';
import 'bootstrap/js/dropdown';
import 'bootstrap/js/collapse';

// Main Sidebar
import Sidebar, { Instance as sidebar } from './utils/sidebar';

// starts the keep alive, auto runs every X seconds
KeepAlive.start();

export default {
    GPM: {
        GPM,
        Instance: gpm
    },
    KeepAlive,
    Dashboard,
    Pages,
    Forms,
    Scrollbar,
    Updates: {
        Updates,
        Instance: updates
    },
    Sidebar: {
        Sidebar,
        Instance: sidebar
    }
};
