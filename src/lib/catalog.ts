export const SKILLS = [
  "C Programming", "Python", "Digital Electronics", "Embedded C", "Arduino", "ESP32", "Sensors & Interfacing",
  "Circuit Design", "PCB Design", "Verilog", "FPGA", "Computer Architecture", "Signal Processing",
  "Machine Learning", "Data Analysis", "Pandas", "NLP", "Statistics", "SQL", "JavaScript", "TypeScript",
  "React", "Node.js", "HTML & CSS", "REST APIs", "MQTT", "Cloud (AWS/GCP)", "Data Visualization", "Git",
];

export const ROLES = [
  "Embedded Systems Engineer", "IoT Engineer", "VLSI Design Engineer", "Hardware Design Engineer",
  "Machine Learning Engineer", "Data Scientist", "Data Analyst", "Full Stack Developer",
  "Frontend Developer", "Backend Developer", "Cloud Engineer",
];

/** Related role families — partial relevance credit for projects in a sibling role. */
export const ROLE_FAMILY: Record<string, string[]> = {
  "Embedded Systems Engineer": ["IoT Engineer", "Hardware Design Engineer"],
  "IoT Engineer": ["Embedded Systems Engineer", "Cloud Engineer"],
  "VLSI Design Engineer": ["Hardware Design Engineer", "Embedded Systems Engineer"],
  "Hardware Design Engineer": ["VLSI Design Engineer", "Embedded Systems Engineer"],
  "Machine Learning Engineer": ["Data Scientist", "Data Analyst"],
  "Data Scientist": ["Machine Learning Engineer", "Data Analyst"],
  "Data Analyst": ["Data Scientist", "Machine Learning Engineer"],
  "Full Stack Developer": ["Frontend Developer", "Backend Developer"],
  "Frontend Developer": ["Full Stack Developer"],
  "Backend Developer": ["Full Stack Developer", "Cloud Engineer"],
  "Cloud Engineer": ["Backend Developer", "IoT Engineer"],
};

/** Core skills per role — used for readiness indicator and roadmap fundamentals. */
export const ROLE_SKILLS: Record<string, string[]> = {
  "Embedded Systems Engineer": ["C Programming", "Embedded C", "Digital Electronics", "Sensors & Interfacing", "ESP32"],
  "IoT Engineer": ["ESP32", "Sensors & Interfacing", "MQTT", "Python", "Cloud (AWS/GCP)"],
  "VLSI Design Engineer": ["Digital Electronics", "Verilog", "FPGA", "Computer Architecture"],
  "Hardware Design Engineer": ["Circuit Design", "PCB Design", "Digital Electronics", "Signal Processing"],
  "Machine Learning Engineer": ["Python", "Machine Learning", "Statistics", "Pandas", "Git"],
  "Data Scientist": ["Python", "Statistics", "Machine Learning", "Data Analysis", "Data Visualization"],
  "Data Analyst": ["SQL", "Python", "Data Analysis", "Data Visualization", "Statistics"],
  "Full Stack Developer": ["JavaScript", "React", "Node.js", "SQL", "REST APIs"],
  "Frontend Developer": ["HTML & CSS", "JavaScript", "TypeScript", "React", "Git"],
  "Backend Developer": ["Node.js", "SQL", "REST APIs", "Python", "Git"],
  "Cloud Engineer": ["Cloud (AWS/GCP)", "Python", "REST APIs", "Git", "SQL"],
};
