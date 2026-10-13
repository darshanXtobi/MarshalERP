# MARKS & GRADING RULES (OFFICIAL CALCULATION ENGINE)

## 1. Statutory 10-Point Grading Scale (UGC / AICTE / Autonomous Standard)
The calculation engine uses the official 10-point Letter Grade and Grade Point mapping:

| Percentage Range Scored ($P$) | Letter Grade | Grade Point ($G_i$) | Academic Performance | Result Status |
|---|:---:|:---:|---|:---:|
| $P \ge 90\%$ | **O** | 10 | Outstanding | PASS |
| $80\% \le P < 90\%$ | **A+** | 9 | Excellent | PASS |
| $70\% \le P < 80\%$ | **A** | 8 | Very Good | PASS |
| $60\% \le P < 70\%$ | **B+** | 7 | Good | PASS |
| $55\% \le P < 60\%$ | **B** | 6 | Above Average | PASS |
| $50\% \le P < 55\%$ | **C** | 5 | Average | PASS |
| $40\% \le P < 50\%$ | **P** | 4 | Pass | PASS |
| $P < 40\%$ | **F** | 0 | Fail / Backlog | FAIL |
| Absent in Component | **Ab** | 0 | Absent | FAIL |

---

## 2. Mathematical SGPA Calculation Formula
For a semester with $N$ registered courses:
- Let $C_i$ be the credits assigned to Course $i$.
- Let $G_i$ be the grade point earned by the student in Course $i$.
- The **Credit Points** earned for Course $i$ is:
  $$\text{Credit Points}_i = C_i \times G_i$$
- The **Semester Grade Point Average (SGPA)** is calculated as:
  $$\text{SGPA} = \frac{\sum_{i=1}^{N} (C_i \times G_i)}{\sum_{i=1}^{N} C_i}$$
  *Rounded to two decimal places.*

---

## 3. Mathematical CGPA Calculation Formula
For a student who has completed $M$ semesters:
- Let $S_j$ be the SGPA achieved in Semester $j$.
- Let $TC_j$ be the total credits of Semester $j$.
- The **Cumulative Grade Point Average (CGPA)** is calculated as:
  $$\text{CGPA} = \frac{\sum_{j=1}^{M} (\text{SGPA}_j \times TC_j)}{\sum_{j=1}^{M} TC_j}$$
  *Or alternatively, total cumulative credit points divided by total cumulative credits earned.*

---

## 4. Academic Progression & Result Classification Rules
1. **Clear PASS**:
   - The student has scored $\ge 40\%$ in every mandatory course and component.
   - Earned Credits = Total Credits.
   - Result: `PASS`.
2. **ATKT (Allowed to Keep Term) / FAIL**:
   - The student failed in $\le 3$ subjects (under autonomous ATKT rules) or $\le 2$ backlogs.
   - Earned Credits < Total Credits.
   - Result: `ATKT` (if eligible to progress) or `FAIL`.
3. **Withheld / Incomplete**:
   - The student was marked absent or disciplinary hold is active.
   - Result: `WITHHELD`.
4. **SGPA Eligibility Rule**:
   - If a student has an `F` grade in any credit course, their provisional SGPA is marked with an asterisk `*` indicating pending backlog clearance.

---

## 5. Verification Test Cases

### Test Case 1: All Subjects Passed
- Course 1 (4 Credits): 85 marks $\rightarrow$ Grade A+ (Point 9) $\rightarrow 4 \times 9 = 36$
- Course 2 (4 Credits): 75 marks $\rightarrow$ Grade A (Point 8) $\rightarrow 4 \times 8 = 32$
- Course 3 (3 Credits): 65 marks $\rightarrow$ Grade B+ (Point 7) $\rightarrow 3 \times 7 = 21$
- Course 4 (3 Credits): 92 marks $\rightarrow$ Grade O (Point 10) $\rightarrow 3 \times 10 = 30$
- Course 5 (2 Credits - Lab): 88 marks $\rightarrow$ Grade A+ (Point 9) $\rightarrow 2 \times 9 = 18$
- Course 6 (2 Credits - Project): 95 marks $\rightarrow$ Grade O (Point 10) $\rightarrow 2 \times 10 = 20$
- **Total Credits** = $4 + 4 + 3 + 3 + 2 + 2 = 18$
- **Total Credit Points** = $36 + 32 + 21 + 30 + 18 + 20 = 157$
- **Expected SGPA** = $157 / 18 = 8.72$
- **Result**: `PASS`

### Test Case 2: One Backlog / Fail
- Course 3: Scored 32 marks ($<40\%$) $\rightarrow$ Grade F (Point 0) $\rightarrow 3 \times 0 = 0$
- Earned Credits = 15 / 18
- **Result**: `ATKT`
