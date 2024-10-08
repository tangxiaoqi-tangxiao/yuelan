import { initialization as initializationWebPage, GetWebPageList } from './webPage';
import { initialization as initializationFavorites } from './favorites';
import { initialization as initializationRightClickMenu } from './rightClickMenu';
import { initialization as initializationWindow } from './System';
import { initialization as initializationAboutHow } from './aboutHow';



function initialization() {
    //web页面操作初始化
    initializationWebPage();
    //获取文件夹
    initializationFavorites();
    //右键菜单操作初始化
    initializationRightClickMenu();
    //系统和窗口操作初始化
    initializationWindow();
    //关于
    initializationAboutHow();
}


export default initialization