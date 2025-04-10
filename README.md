# Stock Finder
Uses two APIs to locate a stock with a user entered stock ticker. If the stock is found, the details and news about the company are shown along with a graph of the stock price.

## How to Use
1. Type in a keyword or stock ticker.
2. Hit enter or click the search button.
3. If the company exists and has details, news, and stock data, they will be automatically shown.
4. You can zoom in and out of the graph by using the slider on the bottom.
5. You can go back to the homepage by clicking the home button.

## APIs and Modules Used
- The free API from _Finnhub_ and _StockData.org_ were used. The one from _StockData_ is used to get the stock prices to create the graph. _Finnhub's_ API does all the rest: find a stock from the search bar and gets the company's details and news.
- Used _AnyChart_ to create the graph of the stock prices.
- Used Webpack to bundle all of these different technologies together.
- Used GitHub to deploy it.
- Html, Css, JavaScript, JQuery

## API Use
Both of the APIs were very easy to use. All that needed to be done was to pass a few pieces of data to it and the API key. For example, to get the market news all you need to do is add /news and the category which is set to general to get general market news.

### Challenges
- One of the APIs that I used at the start [Alpha Vantage](https://www.alphavantage.co/documentation/) had a strict limit of 25 API calls per day. This was not enough especially for testing purposes. So I found two different ones that have generous limits of 60 calls per minutes and 100 calls per day.
- The animations were a pain to figure out. It just required a lot of testing to eventually get it right.
- Creating the search bar auto-complete was a pain. 

### API Documentation
- [Finnhub](https://finnhub.io/docs/api)
- [StockData.org](https://www.stockdata.org/documentation)