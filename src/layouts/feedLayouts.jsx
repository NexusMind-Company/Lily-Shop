import React from 'react';
import { Outlet } from 'react-router-dom';
import { FeedProvider } from '../context/FeedContext';

// This component's only job is to provide the context
// to the child routes rendered by <Outlet />.
const FeedLayout = () => {
  return (
    <FeedProvider>
      <Outlet />
    </FeedProvider>
  );
};

export default FeedLayout;