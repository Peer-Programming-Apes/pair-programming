import Image from "next/image";
import Layout from "../components/Layout.js";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addUser, removeUser } from "../store/userSlice";
import { addToken, removeToken } from "../store/authTokenSlice";
import styles from "../styles/Home.module.css";
import { Button, Form } from "react-bootstrap";


const Home = () => {
	// const [ready, setReady] = useState(false);	// for other pages
	const dispatch = useDispatch();
	const isLoggedIn = useSelector((state) => state.auth.token);

	useEffect(async () => {
		console.log("inside useeffect");

		// Fetch data from external API
		const res = await fetch("http://localhost:4000/profile", {
			credentials: "include",
		});

		console.log(res.ok);

		if (!res.ok) {
			console.log("Server !ok");
			// redirect kore de home page e na thakle
			return;
		}

		const data = await res.json();
		// Pass data to the page via props
		console.log("data received serverside");



		if (data.user) {
			console.log("user received");
			const { _id, email, name, googleID, picture } = data.user;
			const userPayload = { _id, email, name, googleID, picture };
			const TOKEN = JSON.stringify(userPayload); //for local storage
			console.log(userPayload);

			//adding user to user state in redux store
			dispatch(addUser(userPayload));
			dispatch(addToken(TOKEN));

			// setReady(true);	// for other pages
		} else {
			console.log("user not received");
			dispatch(removeToken());
			dispatch(removeUser());
		}

	}, []);


	const createLinkHandler = (e) => {
		e.preventDefault();
		if (!isLoggedIn) {
			window.location.href = "http://localhost:4000/auth/google";
		}
	};
	const joinLinkHandler = (e) => {
		e.preventDefault();
		if (!isLoggedIn) {
			window.location.href = "http://localhost:4000/auth/google";
		}
	};

	return (
		<Layout>
			<div className={styles.homepage}>
				<div className="mt-3" height="500" width="500">
					<Image src="/co-working.svg" height="500" width="500" />
				</div>
				<div className={styles.contents}>
					<div className={styles.subHeading}>Think and Code Together, in</div>
					<div className={styles.heading}>Apes Collab</div>
					<div className={styles.description}>
						Turn your best ideas into reality, by coding and building together
						with your peers and friends, in real-time. So what are you waiting
						for? Let's dive in.
					</div>
					<div className="d-flex w-100 justify-content-around">
						<Button className={styles.formButton} onClick={createLinkHandler}>
							Create Link
						</Button>

						<Form className="d-flex">
							<Form.Control
								className={styles.formInput}
								type="text"
								placeholder="Enter link"
							/>
							<Button
								className={styles.formButton}
								type="submit"
								onClick={joinLinkHandler}
							>
								Join Link
							</Button>
						</Form>
					</div>
				</div>
			</div>
		</Layout>
	);
};

export default Home;
