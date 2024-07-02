import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-auth.js";
import { getFirestore, getDoc, doc, updateDoc, setDoc, increment } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-firestore.js";

const firebaseConfig = {
 //Your Firebase api
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth();
const db = getFirestore(app);

onAuthStateChanged(auth, (user) => {
    const loggedInUserId = localStorage.getItem('loggedInUserId');
    if (loggedInUserId) {
        console.log(user);
        const docRef = doc(db, "users", loggedInUserId);
        getDoc(docRef)
            .then((docSnap) => {
                if (docSnap.exists()) {
                    const userData = docSnap.data();
                    document.getElementById('loggedUserFName').innerText = userData.firstName;
                    document.getElementById('loggedUserEmail').innerText = userData.email;
                    document.getElementById('loggedUserLName').innerText = userData.lastName;
                } else {
                    console.log("No document found matching ID");
                }
            })
            .catch((error) => {
                console.log("Error getting document:", error);
            });
    } else {
        console.log("User ID not found in local storage");
    }
});

const logoutButton = document.getElementById('logout');

logoutButton.addEventListener('click', () => {
    localStorage.removeItem('loggedInUserId');
    signOut(auth)
        .then(() => {
            window.location.href = 'index.html';
        })
        .catch((error) => {
            console.error('Error signing out:', error);
        });
});

document.querySelectorAll('.votebutton_anchor').forEach(button => {
    button.addEventListener('click', (e) => {
        e.preventDefault();
        const groupId = e.target.getAttribute('data-group');
        const loggedInUserId = localStorage.getItem('loggedInUserId');

        if (!loggedInUserId) {
            alert("Please log in to vote.");
            return;
        }

        const userVoteDocRef = doc(db, "userVotes", loggedInUserId);
        getDoc(userVoteDocRef).then(docSnap => {
            if (docSnap.exists()) {
                alert("You have already voted.");
            } else {
                const groupVoteDocRef = doc(db, "groupVotes", `group${groupId}`);
                updateDoc(groupVoteDocRef, {
                    votes: increment(1)
                }).then(() => {
                    setDoc(userVoteDocRef, { voted: true });

                    alert("Thank you for voting!");
                    updateVoteCounts();
                }).catch(error => {
                    console.error("Error updating document:", error);
                });
            }
        }).catch(error => {
            console.error("Error getting document:", error);
        });
    });
});


