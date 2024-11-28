export async function getAdminData() {
    const response = await fetch(
      `https://table-d13fe-default-rtdb.firebaseio.com/adminData.json`
    );
    const data = await response.json();
    return data;
  }