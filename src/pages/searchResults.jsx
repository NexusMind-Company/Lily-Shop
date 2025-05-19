import SearchResults from "../components/shop/searchResults";
import SEO from '../components/common/SEO';
import { useSearchParams } from 'react-router-dom';

const searchResults = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';

  return (
    <>
      <SEO 
        title={`${query ? query + ' - ' : ''}Search Results - Lily Shops`}
        description={`Find ${query ? query + ' ' : ''}shops and products on Lily Shops. Browse through our curated selection of local businesses.`}
        keywords={`${query}, search, local shops, ${query ? query + ' shops, ' : ''}Lily Shops, find shops`}
        type="website"
      />
      <section>
        <SearchResults />
      </section>
    </>
  );
};

export default searchResults;
