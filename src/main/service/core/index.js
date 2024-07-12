import { GetWebPageList } from './webPage';
import { GetFavoritesList } from './favorites';
import { openWebPage,exportWebPage,exportWebPageList } from './rightClickMenu';


function initialization() {
    //获取页面集合
    GetWebPageList();
    //获取文件夹
    GetFavoritesList();
    //使用浏览器打开网页
    openWebPage();
    exportWebPage();
    exportWebPageList();
}


export default initialization