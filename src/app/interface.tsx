export interface Member {
  name: string;
  job: string;
}

export interface Genre {
  id: number;
  name: string;
}

export interface Credits {
  crew: Member[];
  cast: Member[];
}

export interface Film {
  id: number;
  name: string;
  credits: Credits;
  poster_path: string;
  title: string;
  release_date: string;
  overview: string;
  genres: Genre[];
  runtime: number;
  vote_count: number;
  vote_average: number;
}

export interface Country {
  english_name: string;
  iso_3166_1: string;
  native_name: string;
}
