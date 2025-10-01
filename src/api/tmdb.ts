import axios from 'axios';
import { Movie } from '../types';

// --- KONFIGURASI API ---

const TOKEN = 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI5ZmQwNmI5MDU0NzMyNzY2NjQyODgxNGI2YWVmZjEyMiIsIm5iZiI6MTc1OTI0MTcxOS44NzEsInN1YiI6IjY4ZGJlNWY3YjdmNzg2ZjRmMGI0MjQxYyIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.74jOQuQLlJZTcBIPEnpJT1f-ExxSX0c5d2vhJkE7O84';

const API_BASE_URL = 'https://api.themoviedb.org/3';
export const BASE_IMAGE_URL = 'https://image.tmdb.org/t/p/w500';
export const ORIGINAL_IMAGE_URL = 'https://image.tmdb.org/t/p/original';


const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Authorization': TOKEN,
    'Content-Type': 'application/json;charset=utf-8',
  },
});

// --- INTERFACE UNTUK RESPON API TMDb ---
interface TmdbMovie {
  id: number;
  title: string;
  poster_path: string;
  backdrop_path: string;
  overview: string;
  genre_ids?: number[]; // Dari daftar film
  genres?: Genre[]; // Dari detail film
  release_date: string;
  vote_average: number;
  'watch/providers'?: TmdbWatchProvidersResponse;
}

interface Genre {
  id: number;
  name: string;
}

interface GetMoviesResponse {
  results: TmdbMovie[];
}

interface GetGenresResponse {
  genres: Genre[];
}

interface TmdbProvider {
    provider_name: string;
    logo_path: string;
}

interface TmdbWatchProviderRegion {
    link: string;
    flatrate?: TmdbProvider[];
}

interface TmdbWatchProvidersResponse {
    results: {
        [countryCode: string]: TmdbWatchProviderRegion;
    };
}


// --- FUNGSI-FUNGSI API ---

let genreMap: Map<number, string> | null = null;

export const getGenreMap = async (): Promise<Map<number, string>> => {
    if (genreMap) return genreMap;
    try {
        const response = await apiClient.get<GetGenresResponse>('/genre/movie/list');
        const genres = response.data.genres;
        const newGenreMap = new Map<number, string>();
        genres.forEach(genre => newGenreMap.set(genre.id, genre.name));
        genreMap = newGenreMap;
        return newGenreMap;
    } catch (error) {
        console.error('Error fetching genres:', error);
        return new Map<number, string>();
    }
};

export const getGenres = async (): Promise<Genre[]> => {
    try {
        const response = await apiClient.get<GetGenresResponse>('/genre/movie/list');
        return response.data.genres;
    } catch (error) {
        console.error('Error fetching genres:', error);
        return [];
    }
};

const mapTmdbMovieToMovie = (tmdbMovie: TmdbMovie, genres: Map<number, string>): Movie => {
  const movieGenres = tmdbMovie.genres 
    ? tmdbMovie.genres.map(g => g.name) 
    : (tmdbMovie.genre_ids || []).map(id => genres.get(id) || 'Unknown').filter(g => g !== 'Unknown');

  const movie: Movie = {
    id: tmdbMovie.id,
    title: tmdbMovie.title,
    posterUrl: tmdbMovie.poster_path ? `${BASE_IMAGE_URL}${tmdbMovie.poster_path}` : 'https://via.placeholder.com/500x750.png?text=No+Image',
    backdropUrl: tmdbMovie.backdrop_path ? `${ORIGINAL_IMAGE_URL}${tmdbMovie.backdrop_path}` : (tmdbMovie.poster_path ? `${ORIGINAL_IMAGE_URL}${tmdbMovie.poster_path}` : 'https://via.placeholder.com/1280x720.png?text=No+Image'),
    description: tmdbMovie.overview,
    genre: movieGenres,
    releaseYear: tmdbMovie.release_date ? new Date(tmdbMovie.release_date).getFullYear() : 0,
    rating: tmdbMovie.vote_average,
    streamingSources: [],
  };

  const providers = tmdbMovie['watch/providers']?.results?.US?.flatrate;
  if (providers) {
      movie.streamingSources = providers.map(p => ({
        platform: p.provider_name,
        url: tmdbMovie['watch/providers']?.results?.US.link || '#'
      }));
  }
  return movie;
};

const fetchAndMapMovies = async (endpoint: string, params = {}): Promise<Movie[]> => {
  try {
    const genres = await getGenreMap();
    const response = await apiClient.get<GetMoviesResponse>(endpoint, { params });
    return response.data.results.map(movie => mapTmdbMovieToMovie(movie, genres));
  } catch (error) {
    console.error(`Error fetching from ${endpoint}:`, error);
    throw new Error(`Gagal mengambil data dari ${endpoint}.`);
  }
};

export const getPopularMovies = (): Promise<Movie[]> => fetchAndMapMovies('/movie/popular');

export const getTopRatedMovies = (): Promise<Movie[]> => fetchAndMapMovies('/movie/top_rated');

export const getNowPlayingMovies = (): Promise<Movie[]> => fetchAndMapMovies('/movie/now_playing');

export const getUpcomingMovies = (): Promise<Movie[]> => fetchAndMapMovies('/movie/upcoming');

export const getMoviesByGenre = (genreId: number): Promise<Movie[]> => fetchAndMapMovies('/discover/movie', { with_genres: genreId, sort_by: 'popularity.desc' });

export const searchMovies = (query: string): Promise<Movie[]> => fetchAndMapMovies('/search/movie', { query });


export const getMovieDetails = async (movieId: number): Promise<Movie | null> => {
  try {
    const genres = await getGenreMap();
    const response = await apiClient.get<TmdbMovie>(`/movie/${movieId}`, {
      params: { append_to_response: 'watch/providers' },
    });
    return mapTmdbMovieToMovie(response.data, genres);
  } catch (error) {
    console.error(`Error fetching details for movie ID ${movieId}:`, error);
    return null;
  }
};