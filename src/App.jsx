import { useState, useEffect } from "react";
import Search from "./Components/Search";
import MovieCard from "./Components/MovieCard";
import { useDebounce } from 'react-use';
import { updateSearchCount } from "./appwrite";

const API_BASE_URL = 'https://api.themoviedb.org/3';

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

const API_OPTIONS = {
  method: 'GET',
  headers: {
    accept: 'application/json',
    Authorization: `Bearer ${API_KEY}`
  }
}


function App() {

  const [searchTerm, setSearchTerm] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [movieList, setMovieList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

  useDebounce(() => setDebouncedSearchTerm(searchTerm), 
  1000, [searchTerm]);

  const fetchMovies = async (query = '') => {
    setIsLoading(true);
    setErrorMessage('');

    try{
      const endpoint = query ? `${API_BASE_URL}/search/movie?query=${encodeURIComponent(query)}` 
      : `${API_BASE_URL}/discover/movie?sort_by=popularity.desc`;

      const response = await fetch(endpoint, API_OPTIONS);

      if (!response.ok) {
        throw new Error('Falha na busca por filmes');
      }

      const data = await response.json();

      if (data.response === 'False') {
        setErrorMessage(data.Error || 'Falha na busca por filmes');
        setMovieList([]);
        return;
      }

      setMovieList(data.results || []);

      if (query && data.results.length > 0) {
        await updateSearchCount(query, data.results[0]);
      }
    } catch (error) {
      console.error(`Error fetching movies: ${error}`);
      setErrorMessage('Erro ao buscar filmes, tente novamente mais tarde.')
    }
    finally {
      setIsLoading(false);
    }
  }


  useEffect(() => {
    fetchMovies(searchTerm);
  }, [debouncedSearchTerm]);

  

  return(
    <>
    <main>

      <div className="pattern"/>
      
      <div className="wrapper">
        <header>
          <img src="./public/hero-img.png" alt="Hero Banner" />
          <h1>Encontre <span className="text-gradient">Filmes</span> Que Você Vai Gostar Sem Complicações</h1>

          <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
        </header>

        <section className="all-movies">
            <h2 className="mt-[40px]">Todos os Filmes</h2>

            {isLoading ? (
              <p className="text-white">Carregando...</p>
            ) : errorMessage ? (
              <p className="text-red-500">{errorMessage}</p>
            ) : (
              <ul>
                {movieList.map((movie) => (
                  <MovieCard  key={movie.id} movie = {movie}/>
                ))}
              </ul>
            )}
        </section>
      </div>
    </main>
    </>
  );
}

export default App
