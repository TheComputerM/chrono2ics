import { createSignal } from "solid-js";
import { Center, Container, Stack } from "styled-system/jsx";
import { Button } from "./components/ui/button";
import { FormLabel } from "./components/ui/form-label";
import { Heading } from "./components/ui/heading";
import { Input } from "./components/ui/input";
import { Link } from "./components/ui/link";
import { Text } from "./components/ui/text";
import { fetchChronoTimetable } from "./lib/chrono";
import { generateICS } from "./lib/generator";

const CalendarIcon = () => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		width="32"
		height="32"
		viewBox="0 0 24 24"
	>
		<title>download calendar</title>
		<path
			fill="none"
			stroke="currentColor"
			stroke-linecap="round"
			stroke-linejoin="round"
			stroke-width="2"
			d="M12.5 21H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v5m-1 4v6m3-3l-3 3l-3-3m0-16v4M8 3v4m-4 4h16"
		/>
	</svg>
);

function App() {
	/** the timetable slug id used in the url */
	const [timetableId, setTimetableId] = createSignal("");

	function download(value: string, name: string) {
		const a = document.createElement("a");
		const url = window.URL.createObjectURL(
			new Blob([value], { type: "text/calendar" }),
		);
		a.setAttribute("download", name);
		a.setAttribute("href", url);
		a.style.display = "none";
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		window.URL.revokeObjectURL(url);
	}

	async function generate() {
		const timetable = await fetchChronoTimetable(timetableId());
		const ics = await generateICS(timetable);

		download(ics, `${timetable.name}.ics`);
	}

	return (
		<Center height="100svh">
			<Container>
				<Stack gap="6" align="center">
					<Heading
						as="h1"
						textStyle={{ sm: "6xl", base: "5xl" }}
						textAlign="center"
					>
						Chrono2ICS
					</Heading>
					<Stack gap="1.5" width={{ md: "sm" }}>
						<FormLabel>ChronoFactorem Timetable URL</FormLabel>
						<Input
							placeholder="chrono.crux-bphc.com/view/..."
							onChange={({ target }) =>
								setTimetableId(
									target.value.substring(
										target.value.lastIndexOf("/") + 1,
										target.value.length,
									),
								)
							}
						/>
					</Stack>
					<Button onClick={generate}>
						<CalendarIcon /> Generate ICS
					</Button>
					<Text color="fg.subtle" textAlign="center">
						The ICS file can be imported into popular calendar services such as{" "}
						<Link
							target="_blank"
							href="https://support.google.com/calendar/thread/3231927?hl=en&msgid=3236002"
						>
							Google
						</Link>
						,{" "}
						<Link
							target="_blank"
							href="https://discussions.apple.com/thread/254625033?answerId=258646444022&sortBy=rank#258646444022"
						>
							iCalendar
						</Link>{" "}
						and{" "}
						<Link
							target="_blank"
							href="https://support.microsoft.com/en-us/office/import-calendars-into-outlook-8e8364e1-400e-4c0f-a573-fe76b5a2d379"
						>
							Outlook
						</Link>{" "}
						etc.
					</Text>
				</Stack>
			</Container>
		</Center>
	);
}

export default App;
