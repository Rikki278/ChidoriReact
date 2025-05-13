import React from 'react';
import { useParams } from 'react-router-dom';
import UserProfileView from './UserProfileView';

const UserProfileViewPage = () => {
  const { userId } = useParams();
  return <UserProfileView userId={userId} isOwn={false} />;
};

export default UserProfileViewPage; 