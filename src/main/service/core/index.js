import { initialization as initializationWebPage, GetWebPageList } from './webPage';
import { GetFavoritesList } from './favorites';
import { initialization as initializationRightClickMenu, openWebPage, exportWebPage, exportWebPageList } from './rightClickMenu';


function initialization() {
    //web页面操作初始化
    initializationWebPage();
    //获取文件夹
    GetFavoritesList();
    //右键菜单操作初始化
    initializationRightClickMenu();
}


export default initialization