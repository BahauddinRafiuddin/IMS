import Task from "../models/Task.js"

export const calculateInternPerformanceService = async (internId, programId) => {
  try {
    const tasks = await Task.find({
      program: programId,
      assignedIntern: internId
    })

    const totalTasks = tasks.length
    const approvedTasks = tasks.filter(t => t.status === "approved").length
    const rejectedTasks = tasks.filter(t => t.status === "rejected").length
    const submittedTasks = tasks.filter(t => t.status === "submitted").length
    const pendingTasks = tasks.filter(t => t.status === 'pending').length
    const lateSubmissions = tasks.filter(t => t.isLate).length

    const reviewedTasks = tasks.filter(
      t => t.reviewStatus === "reviewed"
    )

    const totalScore = reviewedTasks.reduce(
      (sum, t) => sum + t.score,
      0
    )

    const averageScore =
      reviewedTasks.length > 0
        ? (totalScore / reviewedTasks.length).toFixed(2)
        : 0

    const completionPercentage =
      totalTasks > 0
        ? ((approvedTasks / totalTasks) * 100).toFixed(2)
        : 0

    let grade = "Fail"

    if (completionPercentage >= 85) grade = "A+"
    else if (completionPercentage >= 70) grade = "A"
    else if (completionPercentage >= 55) grade = "B"
    else if (completionPercentage >= 40) grade = "C"

    return { totalTasks, submittedTasks, approvedTasks, pendingTasks ,rejectedTasks, lateSubmissions, averageScore, completionPercentage, grade }

  } catch (error) {
    console.log(error)
    return error
  }
}