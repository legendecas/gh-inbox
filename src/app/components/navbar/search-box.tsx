import React from 'react';
import './search-box.css';

export function SearchBox() {
  return (
    <div className='search-box w-100'>
      <input className='w-full' type='text' placeholder='Search...' />
    </div>
  );
}
