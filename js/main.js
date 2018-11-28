/* globals APIKEY*/

let mycode = (function () {


    const movieDataBaseURL = "https://api.themoviedb.org/3/";
    let imageURL = null;
    let imageSizes = [];

    let searchString = "";
    let cheeseTypeKey = "cheeseTypeKey";
    let imageURLKey = "imageURLKey";
    let imageSizesKey = "imageSizesKey";
    let timeKey = "timeKey";
    let staleDataTimeOut = 3600; // 30 seconds, good for testing

    document.addEventListener("DOMContentLoaded", init);

    function init() {
        //console.log(APIKEY);

        addEventListeners();
        getDataFromLocalStorage();
        //saveDataToLocalStorage();
    }

    function addEventListeners() {
        document.querySelector(".backbuttondiv").addEventListener("click", backButton);
        document.addEventListener("keypress", function (e) {

            if (e.keyCode === 13) {

                startSearch();

            }

            //        console.log(e.keyCode);

        });

        let searchButton = document.querySelector(".searchButtonDiv");
        searchButton.addEventListener("click", startSearch);

        document.querySelector("#button").addEventListener("click", showOverlay);
        document
            .querySelector(".cancelButton")
            .addEventListener("click", hideOverlay);
        document.querySelector(".overlay").addEventListener("click", hideOverlay);

        document.querySelector(".saveButton").addEventListener("click", function (e) {
            let cheeseList = document.getElementsByName("cheese");
            let cheeseType = null;
            for (let i = 0; i < cheeseList.length; i++) {
                if (cheeseList[i].checked) {
                    cheeseType = cheeseList[i].value;
                    console.log(cheeseType);
                    break;
                }
            }
            localStorage.setItem(cheeseTypeKey, JSON.stringify(cheeseType));
            if (cheeseType == "tv") {
                document.querySelector(".mainHeader").textContent = "Get TV Recommendations";
            } else {
                document.querySelector(".mainHeader").textContent = "Get Movie Recommendations";
            }
            //        let x = JSON.parse(localStorage.getItem(cheeseTypeKey));
            //        console.log(x);
            alert(cheeseType);
            console.log("You picked " + cheeseType);
            hideOverlay(e);
        });

        
    }


    function backButton() {
        console.log("hi?");

        if (document.querySelector("#recommend-results").classList[1] !==
            "hide") {
            document.querySelector("#recommend-results").classList.add("hide");
            document.querySelector("#search-results").classList.remove("hide");
        } else {
            document.querySelector("#search-results").classList.add("hide");

        }

    }

    function showOverlay(e) {
        e.preventDefault();
        let overlay = document.querySelector(".overlay");
        overlay.classList.remove("hide");
        overlay.classList.add("show");
        showModal(e);
    }

    function showModal(e) {
        e.preventDefault();
        let modal = document.querySelector(".modal");
        modal.classList.remove("off");
        modal.classList.add("on");
    }

    function hideOverlay(e) {
        e.preventDefault();
        e.stopPropagation(); // don't allow clicks to pass through
        let overlay = document.querySelector(".overlay");
        overlay.classList.remove("show");
        overlay.classList.add("hide");
        hideModal(e);
    }

    function hideModal(e) {
        e.preventDefault();
        let modal = document.querySelector(".modal");
        modal.classList.remove("on");
        modal.classList.add("off");
    }

    function getDataFromLocalStorage() {
        console.log("checking");

        if (localStorage.getItem(imageSizesKey) && localStorage.getItem(imageURLKey) && localStorage.getItem(timeKey)) {
            console.log("Keys exist!");
            imageURL = localStorage.getItem(imageURLKey);
            imageSizes = localStorage.getItem(imageSizesKey);
            console.log(localStorage.getItem(imageSizesKey));
            console.log(localStorage.getItem(imageURLKey));
            let savedDate = localStorage.getItem(timeKey); // get the saved date sting
            savedDate = new Date(savedDate); // use this string to initialize a new Date object
            console.log(savedDate);
            let seconds = calculateElapsedTime(savedDate);

            if (seconds > staleDataTimeOut) {
                console.log("Local Storage Data is stale");
                getPosterURLAndSizes();
            }
        } else {
            console.log("lose one of the key");
            getPosterURLAndSizes();
        }
    }

    function saveDateToLocalStorage() {
        console.log("Saving current Date to Local Storage");
        let now = new Date();
        localStorage.setItem(timeKey, now);
    }

    function calculateElapsedTime(savedDate) {
        let now = new Date(); // get the current time
        console.log(now);

        // calculate elapsed time
        let elapsedTime = now.getTime() - savedDate.getTime(); // this in milliseconds

        let seconds = Math.ceil(elapsedTime / 1000);
        console.log("Elapsed Time: " + seconds + " seconds");
        return seconds;
    }

    function getLocalStorageData() {
       


        // Check if image secure base url and sizes array are saved in Local Storage, if not called getPosterURLAndSizes()

        // if in Local Storage checknif saved over 60 minuites old, if true call getposterURLAndSizes()

        // in Local Storage AND < 60 minutes old, load and use from local storage

        //        getPosterURLAndSizes();
        //saveDataToLocalStorage();
    }

    function getPosterURLAndSizes() {
        console.log("are you kidding?");

        let url = `${movieDataBaseURL}configuration?api_key=${APIKEY}`;
        fetch(url)
            .then(function (response) {
                return response.json();
            })
            .then(function (data) {

                console.log(data);
                saveDateToLocalStorage();
                imageURL = data.images.secure_base_url;
                imageSizes = data.images.poster_sizes;

                localStorage.setItem(imageURLKey, JSON.stringify(imageURL));
                localStorage.setItem(imageSizesKey, JSON.stringify(imageSizes));

                console.log(localStorage.getItem(imageURLKey));
                console.log(imageURL);
                console.log(imageSizes);
            })
            .catch(function (error) {
                console.log(error)
            })
    }

    function startSearch() {

        console.log("start search");
        document.querySelector("#search-results").classList.remove("hide");
        searchString = document.getElementById("search-input").value;
        if (!searchString) {
            alert("Please enter search data");

            document.getElementById("search-input").focus();

            return;

        }

        // this is a new search so you should reset any existing page data

        getSearchResults();

    }

    function getSearchResults() {

        //cheese = getDataFromLocalStorage("cheese");
        let cheeseType = JSON.parse(localStorage.getItem(cheeseTypeKey));
        let url = `${movieDataBaseURL}search/${cheeseType}?api_key=${APIKEY}&query=${searchString}`;

        fetch(url)
            .then((response) => response.json())
            .then(function (data) {

                console.log(data);

                createPage(data);
            })
            .catch((error) => alert(error));

    }

    function createPage(data) {

        let content = document.querySelector("#search-results>.content");
        content.innerHTML = "";
        let title = document.querySelector("#search-results>.title");

        let message = document.createElement("h2");
        content.innerHTML = "";
        title.innerHTML = "";

        if (data.total_results == 0) {

            message.innerHTML = `No results found for ${searchString}`;

        } else {
            message.innerHTML = `Total results = ${data.total_results} for ${searchString}`;

        }

        title.appendChild(message);

        let documentFragment = new DocumentFragment();

        documentFragment.appendChild(createMovieCards(data.results));

        content.appendChild(documentFragment);

        let cardList = document.querySelectorAll(".content>div");

        cardList.forEach(function (item) {
            item.addEventListener("click", getRecommendations);
        });

    }

    function createMovieCards(results) {

        let documentFragment = new DocumentFragment(); // use a documentFragment for performance


        results.forEach(function (movie) {
            let movieCard = document.createElement("div");
            let section = document.createElement("section");
            let image = document.createElement("img");
            let videoTitle = document.createElement("p");
            let videoDate = document.createElement("p");
            let videoRating = document.createElement("p");
            let videoOverview = document.createElement("p");

            if (JSON.parse(localStorage.getItem(cheeseTypeKey)) == "tv") {
                videoTitle.textContent = movie.name;
                videoDate.textContent = movie.first_air_date;
                movieCard.setAttribute("data-title", movie.name);
            } else {
                videoTitle.textContent = movie.title;
                videoDate.textContent = movie.release_date;
                movieCard.setAttribute("data-title", movie.title);
            }

            // set up the content

            videoRating.textContent = movie.vote_average;
            videoOverview.textContent = movie.overview;

            imageURL = JSON.parse(localStorage.getItem(imageURLKey));
            imageSizes = JSON.parse(localStorage.getItem(imageSizesKey));
            image.src = `${imageURL}${imageSizes[2]}${movie.poster_path}`;
            image.setAttribute("alt", "image is not available");

            // set up movie data attributes
            //movieCard.setAttribute("data-title", movie.);
            movieCard.setAttribute("data-id", movie.id);

            // set up class names
            movieCard.className = "movieCard";
            section.className = "imageSection";


            // append elements
            section.appendChild(image);
            movieCard.appendChild(section);
            movieCard.appendChild(videoTitle);
            movieCard.appendChild(videoDate);
            movieCard.appendChild(videoRating);
            movieCard.appendChild(videoOverview);

            documentFragment.appendChild(movieCard);

        });

        return documentFragment;

    }

    function getRecommendations() {
        //console.log(this);
        let movieTitle = this.getAttribute("data-title");
        let movieID = this.getAttribute("data-id");
        console.log("you clicked: " + movieTitle + " " + movieID);
        let cheeseType = JSON.parse(localStorage.getItem(cheeseTypeKey));
        let url = `${movieDataBaseURL}${cheeseType}/${movieID}/recommendations?api_key=${APIKEY}`;



        let content = document.querySelector("#recommend-results>.content");
        fetch(url)
            .then((response) => response.json())
            .then(function (data) {
                content.innerHTML = "";
                console.log(data);
                let documentFragment = new DocumentFragment();

                documentFragment.appendChild(createMovieCards(data.results));

                content.appendChild(documentFragment);

                let cardList = document.querySelectorAll(".content>div");

                cardList.forEach(function (item) {
                    item.addEventListener("click", getRecommendations);
                });
                document.querySelector("#search-results").classList.add("hide");
            })
            .catch((error) => alert(error));


    }

})();
