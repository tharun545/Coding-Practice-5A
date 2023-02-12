const express = require("express");

const app = express();

app.use(express.json());

const { open } = require("sqlite");

const sqlite3 = require("sqlite3");

const path = require("path");

let db = null;

const dbPath = path.join(__dirname, "moviesData.db");

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(5000, () => {
      console.log("Server Started at http://localhost:5000");
    });
  } catch (e) {
    process.exit(1);
  }
};

initializeDBAndServer();

const convertObjectToResponseObjectMovies = (object) => {
  return {
    movieId: object.movie_id,
    directorId: object.director_id,
    movieName: object.movie_name,
    leadActor: object.lead_actor,
  };
};

const convertObjectToResponseObjectDirector = (object) => {
  return {
    directorId: object.director_id,
    directorName: object.director_name,
  };
};

//API 1 GET Method - Movies
app.get("/movies/", async (request, response) => {
  const getQuery = `SELECT movie_name as movieName FROM movie;`;
  const getResult = await db.all(getQuery);
  response.send(getResult);
});

//API 2 POST Method - Movies
app.post("/movies/", async (request, response) => {
  const queryDetails = request.body;
  const { directorId, movieName, leadActor } = queryDetails;
  const addMovieQuery = `
  INSERT INTO movie (director_id, movie_name, lead_actor)
  VALUES (
      ${directorId}, 
    '${movieName}', 
    '${leadActor}');`;
  await db.run(addMovieQuery);
  response.send("Movie Successfully Added");
});

//API 3 GET Method - Movies
app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const getQuery = `SELECT * FROM movie WHERE movie_id = ${movieId};`;
  const getMovieResult = await db.get(getQuery);
  response.send(convertObjectToResponseObjectMovies(getMovieResult));
});

//API 4 PUT Method - Movies based on Movies ID
app.put("/movies/:movieId/", async (request, response) => {
  const updateQueryDetails = request.body;
  const { movieId } = request.params;
  const { directorId, movieName, leadActor } = updateQueryDetails;
  const updateMovie = `
    UPDATE movie 
    SET 
    director_id = ${directorId},
    movie_name = '${movieName}',
    lead_actor = '${leadActor}'
    WHERE movie_id = ${movieId};`;
  const updatedResult = await db.run(updateMovie);
  response.send("Movie Details Updated");
});

//API 5 DELETE Method - Movie
app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const deleteQuery = `DELETE FROM movie WHERE movie_id = ${movieId}`;
  await db.run(deleteQuery);
  response.send("Movie Removed");
});

//API 6 GET Method - Director
app.get("/directors/", async (request, response) => {
  const getDirector = `SELECT * FROM director;`;
  const directorResult = await db.all(getDirector);
  response.send(
    directorResult.map((each) => convertObjectToResponseObjectDirector(each))
  );
});

//API 7 GET Method by using Director Id
app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const getMovieName = `SELECT 
  movie_name as movieName FROM 
  movie WHERE director_id = ${directorId};`;
  const movieResult = await db.all(getMovieName);
  response.send(movieResult);
});

module.exports = app;
