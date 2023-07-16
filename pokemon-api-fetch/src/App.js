import React, { useState, useEffect } from 'react';
import { Button } from '@mui/material'
import { getPokemon, getAllPokemon, getSearchedPokemon } from './services/pokemon';
import Card from './components/Card/Card';
import Navbar from './components/Navbar/Navbar'
import './App.css';

function App() {

  // Functionality for showing all the Pokemon, 20 per page

  const [pokemonData, setPokemonData] = useState([]);
  const [nextUrl, setNextUrl] = useState('');         // Next Page
  const [prevUrl, setPrevUrl] = useState('');         // Previous Page
  const [loading, setLoading] = useState(true);       // For the loading when fetching
  const initialUrl = 'https://pokeapi.co/api/v2/pokemon';

  useEffect(() => {
    async function fetchData() {
      let response = await getAllPokemon(initialUrl);
      setNextUrl(response.next);
      setPrevUrl(response.previous);
      await loadingPokemon(response.results);
      setLoading(false);
    }
    fetchData();
  }, []);

  const nextPage = async () => {
    setLoading(true);
    let data = await getAllPokemon(nextUrl);
    await loadingPokemon(data.results)
    setNextUrl(data.next);
    setPrevUrl(data.previous);
    setLoading(false);
  };

  const previousPage = async () => {
    if(!prevUrl) return;
    setLoading(true);
    let data = await getAllPokemon(prevUrl);
    await loadingPokemon(data.results)
    setNextUrl(data.next);
    setPrevUrl(data.previous);
    setLoading(false);
  };

  const loadingPokemon = async (data) => {
    let allPokemonData = await Promise.all(
      data.map(async pokemon => {
        let pokemonRecord = await getPokemon(pokemon.url);
        return pokemonRecord;
      })
    );
    setPokemonData(allPokemonData);
  };

  // Functionality for searching one Pokemon
  const [pokemonQuery, setPokemonQuery] = useState('');
  const [pokemonSearched, setPokemonSearched] = useState(false);
  const [pokemonQueryData, setPokemonQueryData] = useState({});

  const searchPokemonByName = async () => {   
    
    // I need to add a functionality for when I get a 404 response. i.e. misspelled name
    // a try catch could work
    
    setLoading(true);

    let data = await getSearchedPokemon(`https://pokeapi.co/api/v2/pokemon/${pokemonQuery.toLowerCase()}`)
    await setPokemonQueryData(data);
      
    setLoading(false);
    setPokemonSearched(true);
  };

  const [selectedButton, setSelectedButton] = useState('') 

  return (
      <div>
        <Navbar />
        <div className='button-container'>
          <Button
            key={'button-1'}
            variant='contained'
            style={{
              width: '200px',
            }}
            size='large'
            onClick={() => setSelectedButton('searchMode')}
          >
              Pokemon Search
          </Button>
          <Button
            key={'button-2'}
            variant='contained'
            style={{
              width: '200px',
            }}
            size='large'
            onClick={() => setSelectedButton('listMode')}
          >
              Catch 'em all
          </Button>
        </div>
        {loading ? (
          <h1>Loading...</h1>
        ) : (
          <>
            {selectedButton == 'searchMode' ? (
              <>
                <div className='searchbar'>
                  <p>Search by name</p>
                  <input 
                    type='text' 
                    placeholder='Type here...' 
                    className='search'
                    onChange={(e) => setPokemonQuery(e.target.value)}
                  />
                  <button className='search-button' onClick={searchPokemonByName}>Search</button>
                </div>
                <div className='card-container'>
                  {!pokemonSearched ? (
                    <></>
                    ) : (
                    <>
                      <Card pokemon={pokemonQueryData} />
                    </>
                  )}
                </div>
              </>
            ) : (
              <>
              </>
            )};
            {selectedButton == 'listMode' ? (
              <>
                <div className='button'>
                  <button onClick={previousPage}>Previous Page</button>
                  <button onClick={nextPage}>Next Page</button>
                </div>
                <div className='grid-container'>
                  {pokemonData.map((pokemon, i) => {
                    return <Card key={i} pokemon={pokemon} />
                  })}
                </div>
                <div className='button'>
                  <button onClick={previousPage}>Previous Page</button>
                  <button onClick={nextPage}>Next Page</button>
                </div>
              </>
            ) : (
              <>
              </>
            )}
          </>
        )}
      </div>
  );
}

export default App;
