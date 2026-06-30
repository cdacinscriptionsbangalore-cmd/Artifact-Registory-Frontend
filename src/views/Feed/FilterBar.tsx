import { Filter, Grid, List, Search } from "lucide-react";
import type React from "react";

interface FilterBarProps {
  layout: string;
  setLayout: (layout: 'grid' | 'list') => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

const FilterBar: React.FC<FilterBarProps> = ({ layout, setLayout, searchTerm, setSearchTerm }) => {
  return (
    // <div className="bg-secondary-background rounded-lg p-4 mb-6">
      <div className="flex flex-col sm:flex-row gap-4 items-center">
        <div className="flex-1 w-full sm:w-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              id='search-bar-input-field'
              placeholder="Search inscriptions, locations, scripts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white text-black pl-10 pr-4 py-2 rounded-lg border border-gray-600 focus:border-orange-500 focus:outline-none"
            />
          </div>
        </div>
        
        {/* <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-4 py-2 bg-primary-background text-gray-300 rounded-lg hover:bg-gray-600 transition-colors">
            <Filter className="w-4 h-4" />
            <span className="hidden sm:inline">Filters</span>
          </button>
          
          <div className="flex bg-primary-background rounded-lg p-1">
            <button
              onClick={() => setLayout('grid')}
              className={`p-2 rounded ${layout === 'grid' ? 'bg-orange-500 text-white' : 'text-gray-400'} transition-colors`}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setLayout('list')}
              className={`p-2 rounded ${layout === 'list' ? 'bg-orange-500 text-white' : 'text-gray-400'} transition-colors`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div> */}
      </div>
    // </div>
  );
};

export default FilterBar;