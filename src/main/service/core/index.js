import { GetWebPageList } from './webPage'
import { GetFavoritesList } from './favorites'


function initialization() {
    //获取页面集合
    GetWebPageList();
    //获取文件夹
    GetFavoritesList();
}


export default initialization