import "./styles.css";
import $ from "jquery";
import anychart from 'anychart';


const API_KEY1 = "cvondihr01qihjtpppg0cvondihr01qihjtpppgg";
const API_KEY2 = "l6Cp8V7e6oJpnThQEB6eN64cE0zq6rWhvnRg7daf";
$(".content").hide();



$( function() {
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
      .done(function(data) {
        console.log(data)
        console.log(data.result[0].symbol)
        autocomplete(data)
      })
      .fail(function() {
        console.log("DIDN'T WORK");
      });
      // autocomplete($("#ticker-search"), ["IBM", "APPL", "NVIDIA"])

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

  /*execute a function presses a key on the keyboard:*/
  // inp.on("keydown", function(e) {
  //     var x = document.getElementById(this.id + "autocomplete-list");
  //     if (x) x = x.getElementsByTagName("div");
  //     if (e.keyCode == 40) {
  //       /*If the arrow DOWN key is pressed,
  //       increase the currentFocus variable:*/
  //       currentFocus++;
  //       /*and and make the current item more visible:*/
  //       addActive(x);
  //     } else if (e.keyCode == 38) { //up
  //       /*If the arrow UP key is pressed,
  //       decrease the currentFocus variable:*/
  //       currentFocus--;
  //       /*and and make the current item more visible:*/
  //       addActive(x);
  //     } else if (e.keyCode == 13) {
  //       /*If the ENTER key is pressed, prevent the form from being submitted,*/
  //       e.preventDefault();
  //       if (currentFocus > -1) {
  //         /*and simulate a click on the "active" item:*/
  //         if (x) x[currentFocus].click();
  //       }
  //     }
  // });
  // function addActive(x) {
  //   /*a function to classify an item as "active":*/
  //   if (!x) return false;
  //   /*start by removing the "active" class on all items:*/
  //   removeActive(x);
  //   if (currentFocus >= x.length) currentFocus = 0;
  //   if (currentFocus < 0) currentFocus = (x.length - 1);
  //   /*add class "autocomplete-active":*/
  //   x[currentFocus].addClass("autocomplete-active");
  // }
  // function removeActive(x) {
  //   /*a function to remove the "active" class from all autocomplete items:*/
  //   for (var i = 0; i < x.length; i++) {
  //     x[i].classList.remove("autocomplete-active");
  //   }
  // }

// Close autocomplete list
function closeAllLists() {
  $("#autocomplete-list").remove();
}
/*execute a function when someone clicks in the document:*/

function displayStock(stock) {
  stock = stock.toUpperCase();
  $.ajax({
    url: "https://finnhub.io/api/v1/quote?",
    method: "GET",
    data: { symbol: stock, token: API_KEY1 },
    dataType: "json"
  })
  .done(function(data) {
    $(".content").slideUp("slow").delay(800);
    setTimeout(function() {
      clearContent();
      getGraphData(stock);
      getCompanyProfile(stock);
      getCompanyNews(stock);
    }, 500)
    $(".content").slideDown("slow");
  })
  .fail(function() {
    console.log("Didn't get stock details");
  });
}

function clearContent() {
  $(".company-header").empty();
  $(".details").empty();
  $("#graph").empty();
  $(".news").empty();
}

function getGraphData(stock) {
  $.ajax({
    url: "https://api.stockdata.org/v1/data/eod?",
    method: "GET",
    data: { symbols: stock, api_token: API_KEY2 },
    dataType: "json"
  })
  .done(function(data) {
    if (data) createGraph(data)
  })
  .fail(function() {
    console.log("Didn't get graph data");
  });
}

function createGraph(rawData) {
  const chartData = rawData.data.map(item => [
    new Date(item.date), item.open, item.high, item.low, item.close
  ]);
  anychart.onDocumentReady(function () {
    // Create a stock chart
    const chart = anychart.stock();
  
    const series = chart.plot(0).line(chartData);
    series.stroke({
      color: "#8c2fff",
      thickness: 2
    })
    // Create a candlestick series
    const indicator = chart.plot(0).priceIndicator({value: "last-visible"});
    
    series.name("Stock Price");

    let background = chart.background();
    background.cornerType("round");
    background.corners(20);
    chart.scroller()
      .fill("#363C5D")       // background fill of the scroller
      .selectedFill("#cac7ff");
    chart.background().fill("#FFFFFF20");
    // Set chart title and container
    chart.title("Stock Price Chart");
    chart.container("graph");

    // Draw the chart
    chart.draw();
  });
}

function getCompanyProfile(stock) {
  $.ajax({
    url: "https://finnhub.io/api/v1/stock/profile2?",
    method: "GET",
    data: { symbol: stock, token: API_KEY1 },
    dataType: "json"
  })
  .done(function(data) {
    if (Object.keys(data).length !== 0) displayCompanyProfile(data);
  })
  .fail(function() {
    console.log("Didn't get company profile");
  });
}

function displayCompanyProfile(data) {
  const companyName = $("<h1>").text(data.name).addClass("company-name");
  const companyCountry = $("<div>").text("Country: " + data.country);
  const companyExchange = $("<div>").text("Exchange: " + data.exchange);
  const companyIndustry = $("<div>").text("Industry: " + data.finnhubIndustry);
  const companyIPO = $("<div>").text("Initial Public Offering: " + data.ipo);
  const companyWebsite = $("<a>").text("Website").attr("href", data.weburl);
  const companyLogo = $("<img>").attr("src", data.logo);
  $(".company-header").append(companyName, companyLogo);
  $(".details").append(companyCountry, companyExchange, companyIndustry, companyIPO, companyWebsite);
  
}

function getCompanyNews(stock) {
  $.ajax({
    url: "https://finnhub.io/api/v1/company-news?",
    method: "GET",
    data: { symbol: stock, from: getDate(true), to: getDate(), token: API_KEY1 },
    dataType: "json"
  })
  .done(function(data) {
    displayCompanyNews(data);
  })
  .fail(function() {
    console.log("Didn't get company news");
  });
}

function displayCompanyNews(data) {
  console.log(data)
  if (data.length > 0) {
    const newsHeader = $("<h2>").text("Company News");
    const newsSection = $(".news");
    newsSection.append(newsHeader);
    for (let i = 0; i < 10; ++i) {
      const newsHeadline = $("<div>").text(data[i].headline).addClass("headline");
      const newsImage = $("<img>").attr("src", data[i].image);
      const newsTime = $("<div>").text(new Date(data[i].datetime * 1000));
      const newsSummary = $("<div>").text(data[i].summary).addClass("summary");
      const newsLink = $("<a>").text("Link to article").attr("href", data[i].url);
  
      newsSection.append($("<div>").append(newsHeadline, newsImage).addClass("article-header"));
      newsSection.append(newsTime, newsSummary, newsLink);
      if (data.length === i + 1) break;
    }
  }
}

function getDate(past=false) {
  const today = new Date();
  const date = past ? new Date(today.setDate(today.getDate() - 7)) : today;
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

