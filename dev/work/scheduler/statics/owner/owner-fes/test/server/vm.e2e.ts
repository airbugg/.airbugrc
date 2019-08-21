import axios from 'axios';

describe('should render post google sync page', () => {
  xit('should render the data without error', async () => {
    const res = await axios.get(app.getUrl('/owner/post-google-sync/'));
    expect(res.data).toContain('ng-app="schedulerOwnerCloseWindowModal"');
  });
});
