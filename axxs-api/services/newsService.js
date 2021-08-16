const axios = require('axios');
class NewsService {
    init(props){
        this.database = props.database;
    }

    async getNewsSettings(facility_id){
       return this.database.NewsSettings.findOne({where:{facility_id:facility_id}});
    }

    async getApiKey(){
        return this.database.ApiKeys.findOne({where:{api_name:'newsapi'}});
    }

    async getNews(category, limit){
        let result = await this.getApiKey();
        let newsApi = axios.create({
            headers: {
                'X-API-Key': `${result.api_key}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });
        return newsApi.get(
            `https://newsapi.org/v2/top-headlines?country=us&category=${category}&pageSize=${limit}`
        );
    }

    async searchNews(keywords, limit){
        let result = await this.getApiKey();
        let newsApi = axios.create({
            headers: {
                'X-API-Key': `${result.api_key}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });
        let cleankeywords = keywords.replace(' ', '');
        return newsApi.get(
            `https://newsapi.org/v2/everything?q=${cleankeywords}&pageSize=${limit}`
        );
    }
}
module.exports = new NewsService();
