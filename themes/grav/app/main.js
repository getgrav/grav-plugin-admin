import GPM, { Instance as gpm } from './utils/gpm';
import KeepAlive from './utils/keepalive';
import Updates, { Instance as updates } from './updates';
import Dashboard from './dashboard';
import Pages from './pages';
import Forms from './forms';
import './plugins';
import './themes';

// bootstrap jQuery extensions
import 'bootstrap/js/dropdown';

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
    Updates: {
        Updates,
        Instance: updates
    }
};
