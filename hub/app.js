let API_KEY;
let thingsRefx;
let unsubscribex;
let db = firebase.firestore();
thingsRefx = db.collection('API');

unsubscribex = thingsRefx.onSnapshot(querySnapshot => {
  querySnapshot.docs.forEach(doc => {
    API_KEY = doc.data().API;
  });
});

function returnAPI() {
let API_KEY;
let thingsRefx;
let unsubscribex;
let db = firebase.firestore();
thingsRefx = db.collection('API');

unsubscribex = thingsRefx.onSnapshot(querySnapshot => {
  querySnapshot.docs.forEach(doc => {
    API_KEY = doc.data().API;
  });
});
return API_KEY
}
