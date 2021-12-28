import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { fetchUser } from "../redux/slices/userSlice";
import { createSession, deleteSession } from "../redux/slices/userSlice";
import Alert from "../components/Alert.js";
import UserInfo from "../components/UserInfo.js";
import JoinForm from "../components/JoinForm.js";
import Loading from "../components/Loading.js";
import styles from "../styles/dashboard.module.css";
import sessions from "../assets/sessions.json";
import SessionList from "../components/SessionList.js";

const Dashboard = () => {
	const dispatch = useDispatch();
	const navigate = useNavigate();
	//passed as a prop to modal to be used as a callback to logout
	// const [loading, setLoading] = useState(true);
	// const [modalResponse, setModalResponse] = useState("");
	const [requestStatus, setRequestStatus] = useState("idle");
	const [joinLinkValue, setJoinLinkValue] = useState("");

	const user = useSelector((state) => state.user);
	// const userId = useSelector((state) => state.user._id);
	const userStatus = useSelector((state) => state.user.status);
	const isLoggedIn = useSelector((state) => state.auth.token);

	useEffect(() => {
		//might need to fetch user data if modal is implemented
		if (userStatus === "idle") {
			dispatch(fetchUser());
		}
	}, [userStatus, dispatch]);

	const logoutHandler = (e) => {
		window.location.href = "http://localhost:4000/auth/logout";
	};

	const getDate = (date) => {
		return date.slice(5, 15);
	};

	// useEffect(() => {
	// 	setTimeout(() => {
	// 		setLoading(false);
	// 	}, 1000);
	// }, []);

	const createLinkHandler = (e) => {
		e.preventDefault();

		if (!isLoggedIn) {
			window.location.href = "http://localhost:4000/auth/google";
		}
	};

	const handleJoinLinkChange = (e) => {
		setJoinLinkValue(e.target.value);
	};

	const joinLinkHandler = (e) => {
		e.preventDefault();

		if (!isLoggedIn) {
			window.location.href = "http://localhost:4000/auth/google";
		}

		//TODO: handle if only id is given
		var URL = joinLinkValue;
		console.log("URL :", URL);
		var newURL = URL.replace(
			/^[a-z]{4,5}\:\/{2}[a-z]{1,}\:[0-9]{1,4}.(.*)/,
			"$1"
		); // http or https

		navigate(newURL);
	};

	//TODO: rename to a meaning full name
	// const handleName = (modalResponse) => {
	// 	setModalResponse(modalResponse);
	// };

	// useEffect(() => {
	// 	console.log("modalResponse :", modalResponse);

	// 	const canSave = requestStatus === "idle" && modalResponse;

	// 	//send request to backend
	// 	if (canSave) {
	// 		(async () => {
	// 			try {
	// 				setRequestStatus("pending");

	// 				const sessRes = await dispatch(
	// 					createSession({ name: modalResponse, userId })
	// 				).unwrap();

	// 				//remove states

	// 				console.log(sessRes); //newly created session data

	// 				//TODO: navigate to the new session
	// 				const URL = `/session/${sessRes.sessionId}`;
	// 				navigate(URL);
	// 			} catch (e) {
	// 				console.log(e);

	// 				//catches error, show a generic alert
	// 				window.alert("enter session name / refresh");
	// 				setRequestStatus("idle");
	// 			}
	// 		})();
	// 	}
	// }, [modalResponse]);

	const handleDeleteSession = async (e) => {
		console.log("deleting session....");
		//get this session id from the respective clicked item
		// const sessionId = "61a9aef6417576b9f074f427";  //deleted session id
		const sessionId = "61c0e931fd1dbb86d17cb546";
		e.preventDefault();

		const canDelete = requestStatus === "idle";

		if (canDelete) {
			try {
				setRequestStatus("pending");

				const deletedSession = await dispatch(
					deleteSession(sessionId)
				).unwrap();

				console.log("IN dashboard -> session deleted", deletedSession);
			} catch (e) {
				console.log(e);

				window.alert("document not deleted try again");
			} finally {
				setRequestStatus("idle");
			}
		}
	};

	if (userStatus === "loading") {
		return <Loading />;
	}
	//TODO: handle in case of error on fetching user for dashboard -> need logout button
	//maybe implicitly open modal
	// else if(userStatus === "rejected"){
	//   return <Error404 />;
	// }
	else if (userStatus === "succeeded") {
		return (
			<>
				<div className={styles.dashboard}>
					<UserInfo />
					<SessionList
						sessions={user.userSessions}
						type={"session"}
						title={"Created Sessions"}
					/>
					<SessionList
						sessions={user.sharedSessions}
						type={"session"}
						title={"Shared Sessions"}
					/>
				</div>
				<div className={styles.buttons}>
					<JoinForm />

					<div className={styles.logoutButton}>
						<Alert alertFunction={logoutHandler} />
					</div>
				</div>
			</>
		);
	} else {
		return <h1>Potenial bug</h1>;
	}
};

export default Dashboard;
