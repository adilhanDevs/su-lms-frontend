import React from "react";
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../api.js";
import {
  Plus,
  UserPlus,
  Users,
  Mail,
  Phone,
  MapPin,
  User,
  Calendar,
  Shield,
  Edit2,
  Eye,
  ChevronRight,
  Search,
  CheckCircle,
  XCircle,
  Loader2,
  BookOpen,
  X
} from "lucide-react";

const LecturersPanel = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    gender: "",
    address: "",
    phone: "",
    email: "",
    password: "",
  });

  // Course allocation fields
  const [allocationData, setAllocationData] = useState({
    semester: "",
    group: "",
    courses: [],
  });
  const [courses, setCourses] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [groups, setGroups] = useState([]);
  const [showAllocation, setShowAllocation] = useState(false);

  const [teachersList, setTeachersList] = useState([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [genderFilter, setGenderFilter] = useState("all");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const toggleCourse = (courseId) => {
    setAllocationData((prev) => ({
      ...prev,
      courses: prev.courses.includes(courseId)
        ? prev.courses.filter((id) => id !== courseId)
        : [...prev.courses, courseId],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    try {
      const submitData = {
        lecturer: {
          username: formData.email.split("@")[0] + "_" + Date.now(),
          first_name: formData.first_name,
          last_name: formData.last_name,
          gender: formData.gender,
          address: formData.address,
          phone: formData.phone,
          email: formData.email,
          ...(formData.password ? { password: formData.password } : {}),
        },
      };

      const response = await api.post("accounts/lecturers/create/", submitData);
      const newLecturerUserId = response.data?.lecturer_user_id;

      // Create course allocation if courses, semester, and group are selected
      if (
        showAllocation &&
        newLecturerUserId &&
        allocationData.courses.length > 0 &&
        allocationData.semester &&
        allocationData.group
      ) {
        try {
          await api.post("api/course-allocations/create/", {
            lecturer: newLecturerUserId,
            courses: allocationData.courses,
            semester: allocationData.semester,
            group: allocationData.group,
          });
        } catch (allocErr) {
          console.error("Allocation error:", allocErr);
          setMessage("Lecturer created, but course allocation failed: " + (allocErr.response?.data ? JSON.stringify(allocErr.response.data) : allocErr.message));
          fetchLecturers();
          return;
        }
      }

      setMessage(
        showAllocation && allocationData.courses.length > 0
          ? "Lecturer created and courses assigned successfully!"
          : "Lecturer created successfully!"
      );

      setFormData({ first_name: "", last_name: "", gender: "", address: "", phone: "", email: "", password: "" });
      setAllocationData({ semester: "", group: "", courses: [] });
      setShowAllocation(false);
      fetchLecturers();
    } catch (err) {
      console.error("Error creating lecturer:", err);
      if (err.response?.data) {
        const d = err.response.data;
        setError("Error: " + (typeof d === "object" ? Object.values(d).flat().join(", ") : d));
      } else {
        setError("An error occurred while creating the lecturer");
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchLecturers = async () => {
    try {
      const response = await api.get("accounts/lecturers/");
      setTeachersList(response.data || []);
    } catch (err) {
      console.error("Error fetching teachers:", err);
    }
  };

  useEffect(() => {
    fetchLecturers();
    api.get("api/courses/").then((r) => setCourses(r.data || [])).catch(() => {});
    api.get("api/semesters/").then((r) => setSemesters(r.data || [])).catch(() => {});
    api.get("accounts/groups/").then((r) => setGroups(r.data || [])).catch(() => {});
  }, []);

  const filteredTeachers = (teachersList.lecturers || teachersList).filter((teacher) => {
    const fullName = `${teacher.lecturer?.first_name || ""} ${teacher.lecturer?.last_name || ""}`.toLowerCase();
    const matchesSearch =
      fullName.includes(searchTerm.toLowerCase()) ||
      (teacher.lecturer?.email || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGender = genderFilter === "all" || teacher.lecturer?.gender === genderFilter;
    return matchesSearch && matchesGender;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Lecturer Management</h1>
              <p className="text-gray-600 mt-1">Create and manage lecturer accounts</p>
            </div>
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
            >
              <ChevronRight className="w-4 h-4 rotate-180" />
              Back to Dashboard
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-medium mb-1">Total Lecturers</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {(teachersList.lecturers || teachersList).length}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-medium mb-1">Active</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {(teachersList.lecturers || teachersList).length}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-medium mb-1">Male</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {(teachersList.lecturers || teachersList).filter((t) => t.lecturer?.gender === "M").length}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center">
                  <User className="w-6 h-6 text-indigo-600" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-medium mb-1">Female</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {(teachersList.lecturers || teachersList).filter((t) => t.lecturer?.gender === "F").length}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-pink-100 flex items-center justify-center">
                  <User className="w-6 h-6 text-pink-600" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Create Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                  <UserPlus className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Create New Lecturer</h2>
                  <p className="text-gray-600">Fill in the details to add a new lecturer</p>
                </div>
              </div>

              {message && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl">
                  <div className="flex items-center gap-2 text-green-700">
                    <CheckCircle className="w-5 h-5" />
                    <p className="font-medium">{message}</p>
                  </div>
                </div>
              )}

              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                  <div className="flex items-center gap-2 text-red-700">
                    <XCircle className="w-5 h-5" />
                    <p className="font-medium">{error}</p>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <span className="flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        Email *
                      </span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      placeholder="lecturer@university.edu"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">First Name *</label>
                    <input
                      type="text"
                      name="first_name"
                      value={formData.first_name}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      placeholder="John"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Last Name *</label>
                    <input
                      type="text"
                      name="last_name"
                      value={formData.last_name}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      placeholder="Doe"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    >
                      <option value="">Select Gender</option>
                      <option value="M">Male</option>
                      <option value="F">Female</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <span className="flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        Phone
                      </span>
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <span className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      Address
                    </span>
                  </label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    placeholder="123 University Ave, City, Country"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <span className="flex items-center gap-2">
                      <Shield className="w-4 h-4" />
                      Custom Password (Optional)
                    </span>
                  </label>
                  <input
                    type="text"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    placeholder="Leave blank to auto-generate and email"
                  />
                </div>

                {/* Course Allocation Toggle */}
                <div className="border-t border-gray-200 pt-6">
                  <button
                    type="button"
                    onClick={() => setShowAllocation(!showAllocation)}
                    className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
                  >
                    <BookOpen className="w-4 h-4" />
                    {showAllocation ? "Hide Course Assignment" : "+ Assign Courses (Optional)"}
                  </button>

                  {showAllocation && (
                    <div className="mt-4 p-4 bg-blue-50 rounded-xl space-y-4">
                      <p className="text-sm text-blue-700 font-medium">
                        Assign this lecturer to courses for a specific semester and group.
                      </p>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Semester</label>
                          <select
                            value={allocationData.semester}
                            onChange={(e) =>
                              setAllocationData((prev) => ({ ...prev, semester: e.target.value }))
                            }
                            className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-sm"
                          >
                            <option value="">Select Semester</option>
                            {semesters.map((s) => (
                              <option key={s.id} value={s.id}>
                                {s.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Group</label>
                          <select
                            value={allocationData.group}
                            onChange={(e) =>
                              setAllocationData((prev) => ({ ...prev, group: e.target.value }))
                            }
                            className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-sm"
                          >
                            <option value="">Select Group</option>
                            {groups.map((g) => (
                              <option key={g.id} value={g.id}>
                                {g.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Courses{" "}
                          {allocationData.courses.length > 0 && (
                            <span className="text-blue-600">({allocationData.courses.length} selected)</span>
                          )}
                        </label>
                        {courses.length === 0 ? (
                          <p className="text-sm text-gray-500">No courses available.</p>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                            {courses.map((c) => (
                              <label
                                key={c.id}
                                className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-colors text-sm ${
                                  allocationData.courses.includes(c.id)
                                    ? "bg-blue-100 border-blue-400 text-blue-800"
                                    : "bg-white border-gray-200 text-gray-700 hover:border-blue-300"
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={allocationData.courses.includes(c.id)}
                                  onChange={() => toggleCourse(c.id)}
                                  className="w-4 h-4 accent-blue-600"
                                />
                                {c.title || c.name}
                              </label>
                            ))}
                          </div>
                        )}
                      </div>

                      {allocationData.courses.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {allocationData.courses.map((id) => {
                            const c = courses.find((x) => x.id === id);
                            return (
                              <span
                                key={id}
                                className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-600 text-white text-xs rounded-full font-medium"
                              >
                                {c?.title || c?.name || id}
                                <button
                                  type="button"
                                  onClick={() => toggleCourse(id)}
                                  className="hover:text-blue-200"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </span>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex justify-end pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className={`px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 font-medium shadow-lg shadow-blue-500/25 transition-all flex items-center gap-2 ${
                      loading ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-5 h-5" />
                        Create Lecturer
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Right Column */}
          <div>
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-6 text-white mb-6">
              <h3 className="text-lg font-bold mb-4">Quick Stats</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-blue-100">Total Lecturers</span>
                  <span className="font-bold">{(teachersList.lecturers || teachersList).length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-blue-100">Available Courses</span>
                  <span className="font-bold">{courses.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-blue-100">Groups</span>
                  <span className="font-bold">{groups.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-blue-100">Semesters</span>
                  <span className="font-bold">{semesters.length}</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h3 className="font-bold text-gray-900 mb-4">Tips</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <div className="w-2 h-2 rounded-full bg-blue-600"></div>
                  </div>
                  <p className="text-sm text-gray-600">Use institutional email for account creation</p>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                    <div className="w-2 h-2 rounded-full bg-green-600"></div>
                  </div>
                  <p className="text-sm text-gray-600">Click "+ Assign Courses" to link courses during creation</p>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                    <div className="w-2 h-2 rounded-full bg-purple-600"></div>
                  </div>
                  <p className="text-sm text-gray-600">Course allocation requires a semester and group</p>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Lecturers Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 mt-8 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900">All Lecturers</h2>
                <p className="text-gray-600 mt-1">Manage and view all lecturer accounts</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search lecturers..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full md:w-64"
                  />
                </div>
                <select
                  value={genderFilter}
                  onChange={(e) => setGenderFilter(e.target.value)}
                  className="px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Genders</option>
                  <option value="M">Male</option>
                  <option value="F">Female</option>
                </select>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50/80 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Lecturer</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Contact</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Gender</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Registration Date</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredTeachers.map((teacher) => (
                  <tr
                    key={teacher.id}
                    className="hover:bg-gray-50/50 transition-colors cursor-pointer group"
                    onClick={() => navigate("/admin/teacher/" + teacher.id)}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <User className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">
                            {teacher.lecturer?.first_name} {teacher.lecturer?.last_name}
                          </p>
                          <p className="text-sm text-gray-500">{teacher.lecturer?.username}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-gray-400" />
                          <p className="text-sm text-gray-700">{teacher.lecturer?.email}</p>
                        </div>
                        {teacher.lecturer?.phone && (
                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4 text-gray-400" />
                            <p className="text-sm text-gray-700">{teacher.lecturer?.phone}</p>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                          teacher.lecturer?.gender === "M"
                            ? "bg-blue-100 text-blue-800"
                            : teacher.lecturer?.gender === "F"
                            ? "bg-pink-100 text-pink-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {teacher.lecturer?.gender === "M" ? "Male" : teacher.lecturer?.gender === "F" ? "Female" : "-"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <p className="text-sm text-gray-700">
                          {new Date(teacher.lecturer?.date_joined).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                        <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
                        Active
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate("/admin/teacher/" + teacher.id);
                          }}
                          className="p-2 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                          title="View"
                        >
                          <Eye className="w-4 h-4 text-blue-600" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate("/admin/teacher/" + teacher.id + "/edit");
                          }}
                          className="p-2 bg-yellow-50 hover:bg-yellow-100 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4 text-yellow-600" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredTeachers.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Lecturers Found</h3>
              <p className="text-gray-600">Try adjusting your search or create a new lecturer</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LecturersPanel;
