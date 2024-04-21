const movieListEl = document.getElementById("movie-list")
const searchInpEl = document.getElementById("search-input")
const apiKey = "58bef8ce"

if (window.location.href.includes("index.html")) {
    searchInpEl.addEventListener("keydown", function(e) {
        if (e.keyCode === 13) {
            document.getElementById("search-btn").click()
        }
    })
}


document.addEventListener("click", function(e){
    if (e.target.id == "search-btn") {
        if (searchInpEl.value !== "") {
            getSearchResult(searchInpEl.value)
        }
    } else if (e.target.dataset.add) {
        handleAddBtnClick(e.target.dataset.add)
    } else if (e.target.dataset.remove) {
        handleRemoveBtnClick(e.target.dataset.remove)
    }
})

async function getSearchResult(movieTitle) {
    let formattedTitle = movieTitle.replace(/ /g, "+")
    const res = await fetch(
        `https://www.omdbapi.com/?s=${formattedTitle}&apikey=${apiKey}`
    )
    const data = await res.json()
    displaySearchResult(data)
}

function displaySearchResult(result) {
    clearInput()
    if (result.Response === "True") {
        displaySearchedMovies(result.Search)
    } else {
        displayNoMovieFound()
    }
}

function clearInput() {
    searchInpEl.value = ""
}

async function displaySearchedMovies(allMovies) {
    searchInpEl.placeholder = "Blade Runner"
    setMovieListElHeight("auto")
    clearMovieListEl()
    for (movie of allMovies) {
        const data = await fetchMovieById(movie.imdbID)
        displayMovie(data, false)
        
        if (isAlreadyAdded(movie.imdbID)) {
            displayAddedMovie(movie.imdbID)
        }
    }
}

function clearMovieListEl() {
    movieListEl.innerHTML = ""
}

async function fetchMovieById(movieId) {
    const res = await fetch(
        `https://www.omdbapi.com/?i=${movieId}&apikey=${apiKey}`
    )
    const data = await res.json()
    return data
}

function displayMovie(movie, isWatchlist) {
    const { Poster, Title, imdbRating, Runtime, Genre, imdbID, Plot } = movie
    const gifSrcsArr = ["https://media4.giphy.com/media/v1.Y2lkPTc5MGI3NjExbzNlMnAzcmtlMXZscHplZHJ1amFyZnlqZW9sMHNlbnh0YjN6MHB3eSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/OPU6wzx8JrHna/giphy.gif", "https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExcWYyNWFteHcxMWR4dW4zZ3VuOHR5Z3cycngyZzdpanNxNGhpN2FubSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/3o6nUQlJnRHafgvBCg/giphy.gif", "https://media3.giphy.com/media/v1.Y2lkPTc5MGI3NjExOWc2dmw5bmVpYjMyeHJlbTVwYTZ2ZGU3eGN4YTBmeWJlcmF4OHgycSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/fAaBpMgGuyf96/giphy.gif"] 
    const posterUrl = Poster !== "N/A" ? Poster : gifSrcsArr[Math.floor(Math.random() * 3)]
    movieListEl.innerHTML += `
    <div class="movie" id="${imdbID}">
        <img src="${posterUrl}" class="poster-img"/>
        <div class="movie-info-one">
            <h2 class="movie-title">${Title}</h2>
            <img src="imgs/star.png" class="star-img"/>
            <p class="movie-rating">${imdbRating}</p>
        </div>
        <div class="movie-info-two">
            <p class="movie-duration">${Runtime}</p>
            <p class="movie-genre">${Genre}</p>
            <div class="add-movie">
                <button class="add-watchlist-btn">
                    <img src="imgs/plus.png" data-add="${imdbID}"/>
                </button>
                <p class="watchlist-txt">Watchlist</p>
            </div>
        </div>
        <p class="movie-plot">${Plot}</p>
    </div>
    <hr>
    `
    
    if (isWatchlist) {
        displayWatchlistMovie(imdbID)
    }
}

function displayWatchlistMovie(movieId) {
    const movieEl = document.getElementById(movieId)
    movieEl.querySelector(".add-watchlist-btn").innerHTML = `<img src="imgs/remove.png" data-remove="${movieId}"/>`
    movieEl.nextElementSibling.classList.add("watchlist-hr")
}

function isAlreadyAdded(movieId) {
    if (getWatchlist() === null || getWatchlist().length === 0) {
        return false
    } else {
        return getWatchlist().includes(movieId)
    }
}

function getWatchlist() {
    return JSON.parse(localStorage.getItem("movies"))
}

function displayAddedMovie(elId) {
    const movieEl = document.getElementById(elId)
    movieEl.querySelector(".add-movie").innerHTML = `<p class="added-movie">Added</p>`
}

function displayNoMovieFound() {
    searchInpEl.placeholder = "Searching something with no data"
    setMovieListElHeight(`50vh`)
    movieListEl.innerHTML = `
    <p class="not-found-txt">Unable to find what you’re looking for. Please try another search.</p>
    `
}

function setMovieListElHeight(height) {
    movieListEl.style.height = height
}

function handleAddBtnClick(movieId) {
    let watchlistArr
    if (getWatchlist() === null) {
        watchlistArr = []
    } else {
        watchlistArr = getWatchlist()
    }
    watchlistArr.push(movieId)
    storeWatchlist(watchlistArr)
    displayAddedMovie(movieId)
}

function storeWatchlist(watchlist) {
    localStorage.setItem("movies", JSON.stringify(watchlist))
}

function handleRemoveBtnClick(movieId) {
    let watchlistArr = getWatchlist()   
    watchlistArr.splice(watchlistArr.indexOf(movieId), 1)
    storeWatchlist(watchlistArr)
    displayWatchlist()
}

function handleMoviesDisplay() {
    if (window.location.href.includes("index.html")) {
        displayNoMovies()
    } else {
        displayWatchlist()
    }
}

function displayNoMovies() {
    setMovieListElHeight(`50vh`)
    movieListEl.innerHTML = `
    <img class="nothing-icon" src="imgs/Icon.png"/>
    <p class="explore-txt">Start exploring</p>
    `
}

async function displayWatchlist() {
    if ( getWatchlist() !== null && getWatchlist().length !== 0) {
        clearMovieListEl()
        setMovieListElHeight("auto")
        let watchlistArr = getWatchlist()
        for (movieId of watchlistArr) {
            const data = await fetchMovieById(movieId)
            displayMovie(data, true)
        }
    } else {
        displayEmptyWatchlist()
    }
}

function displayEmptyWatchlist() {
    setMovieListElHeight(`50vh`)
    movieListEl.innerHTML = `
    <p class="empty-watchlist-txt">Your watchlist is looking a little empty...</p>
    <div class="add-movies">
        <a href="index.html">
            <img src="imgs/plus.png"/>
        </a>
        <p class="add-movies-txt">Let's add some movies!</p>
    </div>
    `
}

handleMoviesDisplay()
