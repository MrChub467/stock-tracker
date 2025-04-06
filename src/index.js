import "./styles.css";
import $ from "jquery";
import anychart from 'anychart';


const API_KEY1 = process.env.API_KEY1;
const API_KEY2 = process.env.API_KEY2;
$(".content").hide();
loadHomePage();


$( function() {
  $(".home-btn").on("click", loadHomePage);
  $(document).on("click", closeAllLists);
  $("#search-bar").on("submit", (e) => {
    e.preventDefault();
    displayStock($("#ticker-search").val());
  })
  $("#search-bar").on("input", (e) => {
    if ($("#ticker-search").val()) {
      $.ajax({
        url: "https://finnhub.io/api/v1/search?",
        method: "GET",
        data: { q: $("#ticker-search").val(), exchange: "US", token: API_KEY1 },
        dataType: "json"
      })
      .done(function(data, response) {
        if (response === "429" || response === 429) {
          $(".details").text("Error: Data limit exceeded. Please try again later");
        } else {
          autocomplete(data)
        }
      })
      .fail(function() {
        console.log("DIDN'T WORK");
      });
    }
  })
});

function autocomplete(data) {  
  closeAllLists();
  const box = $("<div>").attr("id", "autocomplete-list").addClass("autocomplete-items");
  $(".autocomplete").append(box);

  for (let i = 0; i < 5; ++i) {
    if (data.result[i].symbol) {
      const element = $("<div>").text(data.result[i].symbol);
      element.on("click", function(e) {
        $("#ticker-search").val("");
        closeAllLists();
        displayStock(data.result[i].symbol);
      });
      box.append(element);
    }
  } 
}
// Close autocomplete list
function closeAllLists() {
  $("#autocomplete-list").remove();
}

function loadHomePage() {
  $(".content").slideUp(1000).delay(1000);
  setTimeout(function() {
    clearContent();
    getMarketStatus();
    getMarketNews();
  }, 1000)
  $(".content").slideDown(1000);
}
function getMarketStatus() {
  $.ajax({
    url: "https://finnhub.io/api/v1/stock/market-status?",
    method: "GET",
    data: { exchange: "US", token: API_KEY1 },
    dataType: "json"
  })
  .done(function(data, response) {
    if (response === "429" || response === 429) {
      $(".details").text("Error: Data limit exceeded. Please try again later");
    } else {
      displayMarketStatus(data);
    }
  })
  .fail(function() {
    console.log("Didn't get market status");
  });
}
function displayMarketStatus(data) {
  const status = $("<div>").addClass("status");
  const exc = $("<div>").text("Exchange: " + data.exchange);
  if (data.isOpen === true) {
    var open = $("<div>").text("Open Status: Open");
  } else {
    var open = $("<div>").text("Open Status: Closed");
  }
  if (data.session) {
    var ses = $("<div>").text("Current session: " + data.session);
  } else {
    var ses = $("<div>").text("Current session: None");
  }
  const zone = $("<div>").text("Timezone: " + (data.timezone).replace("_", " "));
  status.append(exc, open, ses, zone);
  $(".content").append(status);
}
function getMarketNews() {
  $.ajax({
    url: "https://finnhub.io/api/v1/news?",
    method: "GET",
    data: { category: "general", token: API_KEY1 },
    dataType: "json"
  })
  .done(function(data, response) {
    if (response === "429" || response === 429) {
      $(".details").text("Error: Data limit exceeded. Please try again later");
    } else {
      displayMarketNews(data);
    }
  })
  .fail(function() {
    console.log("Didn't get market news");
  });
}
function displayMarketNews(data) {
  displayNews(data, "Market");
}

// Calls functions to get the company data and chart a graph
function displayStock(stock) {
  stock = stock.toUpperCase();
  
  $(".content").slideUp(1000).delay(1000);
  setTimeout(function() {
    clearContent();
    getGraphData(stock);
    getCompanyProfile(stock);
    getCompanyNews(stock);
  }, 1000)
  $(".content").slideDown(1000);
    
}

// Clears the contents so a new company can be displayed
function clearContent() {
  $(".content").empty();
}

// Gets historical data to build a graph then passes that data to another function that graphs it
function getGraphData(stock) {
  $.ajax({
    url: "https://api.stockdata.org/v1/data/intraday?",
    method: "GET",
    data: { symbols: stock, interval: "hour", api_token: API_KEY2 },
    dataType: "json"
  })
  .done(function(data) {
    if (data) createGraph(data)
  })
  .fail(function() {
    console.log("Didn't get graph data");
  });
}
// Creates a graph from historical data
function createGraph(rawData) {
  const chartData = rawData.data.map((item) => [
    new Date(item.date), item.data.open, item.data.high, item.data.low, item.data.close
  ]);
  anychart.onDocumentReady(function () {
    // Create a stock chart
    const chart = anychart.stock();
    
    const series = chart.plot(0).line(chartData);
    series.stroke({
      color: "#8c2fff",
      thickness: 2
    })
    // Create a Price Indicator series
    const indicator = chart.plot(0).priceIndicator({value: "last-visible"});
    
    series.name("Stock Price");
    // Coloring 
    let background = chart.background();
    background.cornerType("round");
    background.corners(20);
    chart.scroller()
      .fill("#363C5D")
      .selectedFill("#cac7ff");
    chart.background().fill("#FFFFFF20");
    // Set chart title and container
    chart.title("Stock Price Chart");
    $("<div>").attr("id", "graph").insertAfter($(".details"));
    chart.container("graph");

    // Draw the chart
    chart.draw();
  });
}
// Gets the company profile details then calls a function that displays them
function getCompanyProfile(stock) {
  $.ajax({
    url: "https://finnhub.io/api/v1/stock/profile2?",
    method: "GET",
    data: { symbol: stock, token: API_KEY1 },
    dataType: "json"
  })
  .done(function(data, response) {
    if (response === "429" || response === 429) {
      $(".details").text("Error: Data limit exceeded. Please try again later");
    } else {
      if (Object.keys(data).length !== 0) displayCompanyProfile(data);
    }
  })
  .fail(function() {
    console.log("Didn't get company profile");
  });
}
// Displays company profile information
function displayCompanyProfile(data) {
  const companyName = $("<h1>").text(data.name).addClass("company-name");
  const companyCountry = $("<div>").text("Country: " + data.country);
  const companyExchange = $("<div>").text("Exchange: " + data.exchange);
  const companyIndustry = $("<div>").text("Industry: " + data.finnhubIndustry);
  const companyIPO = $("<div>").text("Initial Public Offering: " + data.ipo);
  const companyWebsite = $("<a>").text("Website").attr("href", data.weburl);
  const companyLogo = $("<img>").attr("src", data.logo);
  $(".content").append($("<header>").addClass("company-header").append(companyName, companyLogo));
  $(".content").append($("<div>").addClass("details").append(companyCountry, companyExchange, companyIndustry, companyIPO, companyWebsite));
}
// Gets company news from one week ago till now
function getCompanyNews(stock) {
  $.ajax({
    url: "https://finnhub.io/api/v1/company-news?",
    method: "GET",
    data: { symbol: stock, from: getDate(true), to: getDate(), token: API_KEY1 },
    dataType: "json"
  })
  .done(function(data, response) {
    if (response === "429" || response === 429) {
      $(".details").text("Error: Data limit exceeded. Please try again later");
    } else {
      displayNews(data, "Company");
    }
  })
  .fail(function() {
    console.log("Didn't get company news");
  });
}
// Displays at most 10 news articles about the company
function displayNews(data, type) {
  if (data.length > 0) {
    const newsHeader = $("<h2>").text(`${type} News`);
    const newsSection = $("<div>").addClass("news");
    newsSection.append(newsHeader);
    for (let i = 0; i < 10; ++i) {
      const newsHeadline = $("<div>").text(data[i].headline).addClass("headline");
      const newsImage = $("<img>").attr("src", data[i].image);
      const newsTime = $("<div>").text(new Date(data[i].datetime * 1000));
      const newsSummary = $("<div>").text(data[i].summary).addClass("summary");
      const newsLink = $("<a>").text("Link to article").attr("href", data[i].url);
      const newsContainer = $("<div>").addClass("articleContainer")
      
      if (data[i].image) {
        newsContainer.append($("<div>").append(newsHeadline, newsImage).addClass("article-header"), newsTime, newsSummary, newsLink)
      } else {
        newsContainer.append($("<div>").append(newsHeadline).addClass("article-header"), newsTime, newsSummary, newsLink)
      }
      newsSection.append(newsContainer);
      if (data.length === i + 1) break;
    }
    $(".content").append(newsSection);
  }
}
// Get today's and the date from one week ago
function getDate(past=false) {
  const today = new Date();
  const date = past ? new Date(today.setDate(today.getDate() - 7)) : today;
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

