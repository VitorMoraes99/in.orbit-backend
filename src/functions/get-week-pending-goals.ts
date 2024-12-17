import dayjs from "dayjs"
import weekOfYear from "dayjs/plugin/weekOfYear"
import { db } from "../db"
import { goalCompletions, goals } from "../db/schema"
import { lte, count, gte, and } from "drizzle-orm"

dayjs.extend(weekOfYear)

export function getWeekPendingGoals() {
    const firstDayOfWeek = dayjs().startOf('week').toDate()
    const lastDayOfweek = dayjs().endOf('week').toDate()

    const goalsCreatedUpToWeek = db.$with('goals_created_up_to_week').as(
        db.select({
            id: goals.id,
            title: goals.title,
            desiredWeeklyFrequency: goals.desiredWeeklyFrequency,
            createAt: goals.createdAt,
        }).from(goals).where(lte(goals.createdAt, lastDayOfweek))
    )

    const goalCompletionCounts = db.$with('goal_completion_counts').as(
        db.select({
            goalId: goalCompletions.goalId,
            completionCount: count(goalCompletions.id),
        }).from(goalCompletions).where(and(
            gte(goalCompletions.createdAt, firstDayOfWeek),
            lte(goalCompletions.createdAt, lastDayOfweek)
        ))
        .groupBy(goalCompletions.goalId)
    )

    const pendingGoals = await db
    .with(goalsCreatedUpToWeek, goalCompletionCounts)
    .select()
    .from(goalsCreatedUpToWeek)

    return sql
}