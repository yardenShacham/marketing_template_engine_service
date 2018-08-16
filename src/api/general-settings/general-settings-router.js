import {AppRouter} from '../infra/router';
import {ELEMENT_TYPES_TO_CODES} from '../../consts/templateEngine'

const router = new AppRouter();


class GeneralSettingsRouter {

    @router.get('/')
    getSettings() {
        return {
            ELEMENT_TYPES_TO_CODES
        };
    }

}

export default router.getRouter();