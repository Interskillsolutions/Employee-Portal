import axiosInstance from '../axiosInstance';

export const fetchTeamMembersApi = async () => {
  return await axiosInstance.get('/manager/team');
};
