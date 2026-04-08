const BASE_URL = 'http://69.62.77.182:8005'
const CLIENT_KEY = 'c2c350fd-a8f1-4df7-8ea6-fc4b6d8096af'
const SCHOOL_ID  = 1

export function getSchoolId() {
  return SCHOOL_ID
}

async function request(method, path, body = null) {
  const headers = { 'Content-Type': 'application/json', 'client_key': CLIENT_KEY }

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })

  const data = await res.json()
  if (!res.ok) throw new Error(data?.message || `Request failed: ${res.status}`)
  return data
}

function qs(params = {}) {
  const q = new URLSearchParams()
  if (params.page)   q.set('page',   params.page)
  if (params.limit)  q.set('limit',  params.limit)
  if (params.search) q.set('search', params.search)
  return q.toString()
}

// ── SCHOOL GROUP ─────────────────────────────────────────────────────────────

export const groupApi = {
  list:    (params = {}) => request('GET', `/api/school_group/grouplist?${qs(params)}`),
  getById: (id)          => request('GET', `/api/school_group/get_id/${id}`),
  create:  (body)        => request('POST', '/api/school_group/create_group', body),
  update:  (id, body)    => request('PUT', `/api/school_group/update_group/${id}`, body),
  delete:  (id)          => request('DELETE', `/api/school_group/delete_group/${id}`),
  dropdown:(params = {}) => request('GET', `/api/school_group/school-groups/all?${qs(params)}`),
}

// ── SCHOOL STREAM ─────────────────────────────────────────────────────────────

export const streamApi = {
  list:    (params = {}) => request('GET', `/api/school_stream/streamlist?${qs(params)}`),
  getById: (id)          => request('GET', `/api/school_stream/get_id/${id}`),
  create:  (body)        => request('POST', '/api/school_stream/create_stream', body),
  update:  (id, body)    => request('PUT', `/api/school_stream/update_stream/${id}`, body),
  delete:  (id)          => request('DELETE', `/api/school_stream/delete_stream/${id}`),
  dropdown:(params = {}) => request('GET', `/api/school_stream/streams/all?${qs(params)}`),
}

// ── SCHOOL CLASS ──────────────────────────────────────────────────────────────

export const classApi = {
  list:    (params = {}) => request('GET', `/api/school_stream_class/classlist?${qs(params)}`),
  getById: (id)          => request('GET', `/api/school_stream_class/get_id/${id}`),
  create:  (body)        => request('POST', '/api/school_stream_class/create_class', body),
  update:  (id, body)    => request('PUT', `/api/school_stream_class/update_class/${id}`, body),
  delete:  (id)          => request('DELETE', `/api/school_stream_class/delete_class/${id}`),
  dropdown:(params = {}) => request('GET', `/api/school_stream_class/classes/all?${qs(params)}`),
}

// ── SCHOOL SUBJECT ────────────────────────────────────────────────────────────

export const subjectApi = {
  list:    (params = {}) => request('GET', `/api/school_stream_subject/subjectlist?${qs(params)}`),
  getById: (id)          => request('GET', `/api/school_stream_subject/get_id/${id}`),
  create:  (body)        => request('POST', '/api/school_stream_subject/create_subject', body),
  update:  (id, body)    => request('PUT', `/api/school_stream_subject/update_subject/${id}`, body),
  delete:  (id)          => request('DELETE', `/api/school_stream_subject/delete_subject/${id}`),
  dropdown:(params = {}) => {
    const q = new URLSearchParams()
    if (params.class_id)   q.set('class_id',   params.class_id)
    if (params.search)     q.set('search',     params.search)
    if (params.limit)      q.set('limit',      params.limit)
    return request('GET', `/api/school_stream_subject/subjects/all?${q}`)
  },
}

// ── SCHOOL SECTION ────────────────────────────────────────────────────────────

export const sectionApi = {
  list:    (params = {}) => request('GET', `/api/school_stream_section/sectionlist?${qs(params)}`),
  getById: (id)          => request('GET', `/api/school_stream_section/get_id/${id}`),
  create:  (body)        => request('POST', '/api/school_stream_section/create_section', body),
  update:  (id, body)    => request('PUT', `/api/school_stream_section/update_section/${id}`, body),
  delete:  (id)          => request('DELETE', `/api/school_stream_section/delete_section/${id}`),
  dropdown:(params = {}) => {
    const q = new URLSearchParams()
    if (params.class_id)        q.set('class_id',        params.class_id)
    if (params.school_stream_id)q.set('school_stream_id',params.school_stream_id)
    if (params.search)          q.set('search',          params.search)
    return request('GET', `/api/school_stream_section/sections/all?${q}`)
  },
}

// ── ROLE ──────────────────────────────────────────────────────────────────────

export const roleApi = {
  list:    (params = {}) => {
    const q = new URLSearchParams()
    if (params.page)      q.set('page',      params.page)
    if (params.limit)     q.set('limit',     params.limit)
    if (params.search)    q.set('search',    params.search)
    if (params.is_active != null) q.set('is_active', params.is_active)
    return request('GET', `/api/employee/role/list?${q}`)
  },
  create:  (body)     => request('POST', '/api/employee/role/create', body),
  update:  (id, body) => request('PUT', `/api/employee/role/update/${id}`, body),
}

// ── EMPLOYEE ──────────────────────────────────────────────────────────────────

function qsEmployee(params = {}) {
  const q = new URLSearchParams()
  if (params.page)    q.set('page',    params.page)
  if (params.limit)   q.set('limit',   params.limit)
  if (params.search)  q.set('search',  params.search)
  if (params.role_id) q.set('role_id', params.role_id)
  return q.toString()
}

export const employeeApi = {
  list:     (params = {}) => request('GET', `/api/employee/employee/list?${qsEmployee(params)}`),
  getById:  (id)          => request('GET', `/api/employee/employee/get_id/${id}`),
  create:   (body)        => request('POST', '/api/employee/employee/create', body),
  update:   (id, body)    => request('PUT', `/api/employee/employee/update/${id}`, body),
  delete:   (id)          => request('DELETE', `/api/employee/employee/delete/${id}`),
  dropdown: (params = {}) => {
    // /employee/all only supports role_id and search (no page/limit)
    const q = new URLSearchParams()
    if (params.role_id) q.set('role_id', params.role_id)
    if (params.search)  q.set('search',  params.search)
    return request('GET', `/api/employee/employee/all?${q}`)
  },
  mappingList: (params = {}) => {
    const q = new URLSearchParams()
    if (params.page)       q.set('page',       params.page)
    if (params.limit)      q.set('limit',      params.limit)
    if (params.emp_id)     q.set('emp_id',     params.emp_id)
    if (params.class_id)   q.set('class_id',   params.class_id)
    if (params.subject_id) q.set('subject_id', params.subject_id)
    return request('GET', `/api/employee/employee/mapping/list?${q}`)
  },
  mappingCreate: (body)     => request('POST', '/api/employee/employee/mapping/create', body),
  mappingUpdate: (id, body) => request('PUT', `/api/employee/employee/mapping/update/${id}`, body),
  mappingDelete: (id)       => request('DELETE', `/api/employee/employee/mapping/delete/${id}`),
  bulkUpload: (file) => {
    const form = new FormData()
    form.append('file', file)
    return fetch(`${BASE_URL}/api/employee/employee/bulk_upload`, {
      method: 'POST',
      headers: { 'client_key': CLIENT_KEY },
      body: form,
    }).then(r => r.json())
  },
}

// ── CLASS SECTION TEACHERS ────────────────────────────────────────────────────

export const classSectionTeacherApi = {
  list: (params = {}) => {
    const q = new URLSearchParams()
    if (params.class_id)       q.set('class_id',       params.class_id)
    if (params.section_id)     q.set('section_id',     params.section_id)
    if (params.school_group_id)q.set('school_group_id',params.school_group_id)
    if (params.search)         q.set('search',         params.search)
    if (params.page)           q.set('page',           params.page)
    if (params.limit)          q.set('limit',          params.limit)
    return request('GET', `/api/teacher/class_section_teacher/list?${q}`)
  },
  create: (body)     => request('POST', '/api/teacher/class_section_teacher/create', body),
  update: (id, body) => request('PUT', `/api/teacher/class_section_teacher/update/${id}`, body),
  delete: (id)       => request('DELETE', `/api/teacher/class_section_teacher/delete/${id}`),
}

// ── EXAM GRADE ────────────────────────────────────────────────────────────────

export const gradeApi = {
  list:       (params = {}) => {
    const q = new URLSearchParams()
    if (params.page)     q.set('page',     params.page)
    if (params.limit)    q.set('limit',    params.limit)
    if (params.search)   q.set('search',   params.search)
    if (params.is_active != null) q.set('is_active', params.is_active)
    return request('GET', `/api/exam/grade/list?${q}`)
  },
  getById:    (id)     => request('GET', `/api/exam/grade/get_id/${id}`),
  create:     (body)   => request('POST', '/api/exam/grade/create', body),
  bulkCreate: (body)   => request('POST', '/api/exam/grade/bulk_create', body),
  delete:     (id)     => request('DELETE', `/api/exam/grade/delete/${id}`),
}

// ── EXAM ──────────────────────────────────────────────────────────────────────

export const examApi = {
  list:    (params = {}) => {
    const q = new URLSearchParams()
    if (params.school_stream_id) q.set('school_stream_id', params.school_stream_id)
    if (params.search)           q.set('search',           params.search)
    if (params.page)             q.set('page',             params.page)
    if (params.limit)            q.set('limit',            params.limit)
    return request('GET', `/api/exam/exam/list?${q}`)
  },
  getById: (id)          => request('GET', `/api/exam/exam/get_id/${id}`),
  create:  (body)        => request('POST', '/api/exam/exam/create', body),
  update:  (id, body)    => request('PUT', `/api/exam/exam/update/${id}`, body),
  delete:  (id)          => request('DELETE', `/api/exam/exam/delete/${id}`),
}

// ── EXAM TIMETABLE ────────────────────────────────────────────────────────────

export const examTimetableApi = {
  list:    (params = {}) => {
    const q = new URLSearchParams()
    if (params.exam_id)          q.set('exam_id',          params.exam_id)
    if (params.school_stream_id) q.set('school_stream_id', params.school_stream_id)
    if (params.school_group_id)  q.set('school_group_id',  params.school_group_id)
    if (params.subject_id)       q.set('subject_id',       params.subject_id)
    if (params.search)           q.set('search',           params.search)
    if (params.page)             q.set('page',             params.page)
    if (params.limit)            q.set('limit',            params.limit)
    return request('GET', `/api/exam/exam/timetable/list?${q}`)
  },
  create:  (body)        => request('POST', '/api/exam/exam/timetable/create', body),
  update:  (id, body)    => request('PUT', `/api/exam/exam/timetable/update/${id}`, body),
  delete:  (id)          => request('DELETE', `/api/exam/exam/timetable/delete/${id}`),
}

// ── EXAM MARKS ────────────────────────────────────────────────────────────────

export const marksApi = {
  list:   (params = {}) => {
    const q = new URLSearchParams()
    if (params.student_id) q.set('student_id', params.student_id)
    if (params.class_id)   q.set('class_id',   params.class_id)
    if (params.subject_id) q.set('subject_id', params.subject_id)
    if (params.page)       q.set('page',       params.page)
    if (params.limit)      q.set('limit',      params.limit)
    return request('GET', `/api/exam/marks/list?${q}`)
  },
  // body: { student_id, class_id, subjects: [{ subject_id, mark }] }
  create: (body) => request('POST', '/api/exam/marks/create', body),
}

// ── ONLINE EXAM ───────────────────────────────────────────────────────────────

export const onlineExamApi = {
  list:    (params = {}) => {
    const q = new URLSearchParams()
    if (params.class_id)   q.set('class_id',   params.class_id)
    if (params.subject_id) q.set('subject_id', params.subject_id)
    if (params.search)     q.set('search',     params.search)
    if (params.page)       q.set('page',       params.page)
    if (params.limit)      q.set('limit',      params.limit)
    return request('GET', `/api/exam/online_exam/list?${q}`)
  },
  create:  (body)        => request('POST', '/api/exam/online_exam/create', body),
  update:  (id, body)    => request('PUT', `/api/exam/online_exam/update/${id}`, body),
  delete:  (id)          => request('DELETE', `/api/exam/online_exam/delete/${id}`),
}

// ── ONLINE CLASS ──────────────────────────────────────────────────────────────

export const onlineClassApi = {
  list:    (params = {}) => {
    const q = new URLSearchParams()
    if (params.class_id)   q.set('class_id',   params.class_id)
    if (params.subject_id) q.set('subject_id', params.subject_id)
    if (params.search)     q.set('search',     params.search)
    if (params.page)       q.set('page',       params.page)
    if (params.limit)      q.set('limit',      params.limit)
    return request('GET', `/api/exam/online_class/list?${q}`)
  },
  create:  (body)        => request('POST', '/api/exam/online_class/create', body),
  update:  (id, body)    => request('PUT', `/api/exam/online_class/update/${id}`, body),
  delete:  (id)          => request('DELETE', `/api/exam/online_class/delete/${id}`),
}

// ── TIMETABLE ─────────────────────────────────────────────────────────────────
// TimeTableCreate: {class_id, section_id, school_id, school_group_id, subject_id,
//   start_time, start_ampm, end_time, end_ampm, duration(int),
//   school_table_name?, type?(W/D), day?(Mon/Tue…)}

export const timetableApi = {
  list:    (params = {}) => {
    const q = new URLSearchParams()
    if (params.school_id)      q.set('school_id',      params.school_id ?? SCHOOL_ID)
    if (params.class_id)       q.set('class_id',       params.class_id)
    if (params.section_id)     q.set('section_id',     params.section_id)
    if (params.school_group_id)q.set('school_group_id',params.school_group_id)
    if (params.subject_id)     q.set('subject_id',     params.subject_id)
    if (params.search)         q.set('search',         params.search)
    if (params.page)           q.set('page',           params.page)
    if (params.limit)          q.set('limit',          params.limit)
    return request('GET', `/api/timetable/list?${q}`)
  },
  getById: (id)          => request('GET', `/api/timetable/get_id/${id}`),
  create:  (body)        => request('POST', '/api/timetable/create', body),
  update:  (id, body)    => request('PUT', `/api/timetable/update/${id}`, body),
  delete:  (id)          => request('DELETE', `/api/timetable/delete/${id}`),
}

// ── ATTENDANCE ────────────────────────────────────────────────────────────────

export const employeeAttendanceApi = {
  list:   (params = {}) => {
    const q = new URLSearchParams()
    if (params.school_group_id) q.set('school_group_id', params.school_group_id)
    if (params.emp_id)          q.set('emp_id',          params.emp_id)
    if (params.attendance_dt)   q.set('attendance_dt',   params.attendance_dt)
    if (params.status)          q.set('status',          params.status)
    if (params.page)            q.set('page',            params.page)
    if (params.limit)           q.set('limit',           params.limit)
    return request('GET', `/api/attendance/employee/attendance/list?${q}`)
  },
  bulkCreate: (body)     => request('POST', '/api/attendance/employee/attendance/bulk', body),
  update:     (id, body) => request('PUT', `/api/attendance/employee/attendance/update/${id}`, body),
  delete:     (id)       => request('DELETE', `/api/attendance/employee/attendance/delete/${id}`),
}

export const studentAttendanceApi = {
  list:   (params = {}) => {
    const q = new URLSearchParams()
    if (params.school_group_id) q.set('school_group_id', params.school_group_id)
    if (params.class_id)        q.set('class_id',        params.class_id)
    if (params.section_id)      q.set('section_id',      params.section_id)
    if (params.student_id)      q.set('student_id',      params.student_id)
    if (params.attendance_dt)   q.set('attendance_dt',   params.attendance_dt)
    if (params.status)          q.set('status',          params.status)
    if (params.page)            q.set('page',            params.page)
    if (params.limit)           q.set('limit',           params.limit)
    return request('GET', `/api/attendance/student/attendance/list?${q}`)
  },
  bulkCreate: (body)     => request('POST', '/api/attendance/student/attendance/bulk', body),
  update:     (id, body) => request('PUT', `/api/attendance/student/attendance/update/${id}`, body),
  delete:     (id)       => request('DELETE', `/api/attendance/student/attendance/delete/${id}`),
}

// ── STUDENT INQUIRY ──────────────────────────────────────────────────────────

function qsInquiry(params = {}) {
  const q = new URLSearchParams()
  q.set('school_id', params.school_id ?? SCHOOL_ID)
  if (params.page)   q.set('page',   params.page)
  if (params.limit)  q.set('limit',  params.limit)
  if (params.search) q.set('search', params.search)
  return q.toString()
}

export const inquiryApi = {
  list:    (params = {}) => request('GET', `/api/student/inquiry/list?${qsInquiry(params)}`),
  getById: (id)          => request('GET', `/api/student/inquiry/get_id/${id}`),
  create:  (body)        => request('POST', '/api/student/inquiry/create', body),
  update:  (id, body)    => request('PUT', `/api/student/inquiry/update/${id}`, body),
  delete:  (id)          => request('DELETE', `/api/student/inquiry/delete/${id}`),
}

// ── STUDENT ───────────────────────────────────────────────────────────────────

function qsStudent(params = {}) {
  const q = new URLSearchParams()
  q.set('school_id', params.school_id ?? SCHOOL_ID)
  if (params.page)       q.set('page',       params.page)
  if (params.limit)      q.set('limit',      params.limit)
  if (params.search)     q.set('search',     params.search)
  if (params.class_id)   q.set('class_id',   params.class_id)
  if (params.section_id) q.set('section_id', params.section_id)
  return q.toString()
}

export const studentApi = {
  list:          (params = {}) => request('GET', `/api/student/student/list?${qsStudent(params)}`),
  getById:       (id)          => request('GET', `/api/student/student/get_id/${id}`),
  create:        (body)        => request('POST', '/api/student/student/create', body),
  update:        (id, body)    => request('PUT', `/api/student/student/update/${id}`, body),
  updateMapping: (id, body)    => request('PUT', `/api/student/student/mapping/update/${id}`, body),
  dropdown:      (params = {}) => request('GET', `/api/student/student/all?${qsStudent(params)}`),
  guardianList:  (params = {}) => {
    const q = new URLSearchParams()
    if (params.class_id)   q.set('class_id',   params.class_id)
    if (params.section_id) q.set('section_id',  params.section_id)
    if (params.page)       q.set('page',         params.page)
    if (params.limit)      q.set('limit',         params.limit)
    if (params.search)     q.set('search',         params.search)
    return request('GET', `/api/student/student/guardian/list?${q}`)
  },
  transfer: (student_id, section_id) =>
    request('POST', `/api/student/student/transfer?student_id=${student_id}&section_id=${section_id}`),
  promote: (from_class_id) =>
    request('POST', `/api/student/student/promote?from_class_id=${from_class_id}`),
  bulkUpload: (school_id, file) => {
    const form = new FormData()
    form.append('file', file)
    return fetch(`${BASE_URL}/api/student/student/bulk_upload?school_id=${school_id}`, {
      method: 'POST',
      headers: { 'client_key': CLIENT_KEY },
      body: form,
    }).then(r => r.json())
  },
}
