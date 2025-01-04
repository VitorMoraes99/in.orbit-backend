
import dayjs from "dayjs"
import weekOfYear from "dayjs/plugin/weekOfYear"
import { db } from "../db"
import { goalCompletions, goals } from "../db/schema"
import { lte, count, gte, and, eq, sql } from "drizzle-orm"

dayjs.extend(weekOfYear)

export async function getWeekPendingGoals() {
    const firstDayOfWeek = dayjs().startOf('week').toDate();
    const lastDayOfWeek = dayjs().endOf('week').toDate();

    const goalsCreatedUpToWeek = db.$with('goals_created_up_to_week').as(
        db.select({
            id: goals.id,
            title: goals.title,
            desiredWeeklyFrequency: goals.desiredWeeklyFrequency,
            createAt: goals.createdAt,
        }).from(goals).where(lte(goals.createdAt, lastDayOfWeek))
    );

    const goalCompletionCounts = db.$with('goal_completion_counts').as(
        db.select({
            goalId: goalCompletions.goalId,
            completionCount: count(goalCompletions.id)
            .as('completionCount'),
        }).from(goalCompletions).where(and(
            gte(goalCompletions.createdAt, firstDayOfWeek),
            lte(goalCompletions.createdAt, lastDayOfWeek)
        ))
        .groupBy(goalCompletions.goalId)
    );

    const pendingGoals = await db
        .with(goalsCreatedUpToWeek, goalCompletionCounts)
        .select({
            id: goalsCreatedUpToWeek.id,
            title: goalsCreatedUpToWeek.title,
            deriredWeeklyFrequency: goalsCreatedUpToWeek.desiredWeeklyFrequency,
            completionCount: sql `
            COALESCE(${goalCompletionCounts.completionCount}, 0)
            `.mapWith(Number),
        })
        .from(goalsCreatedUpToWeek)
        .leftJoin(goalCompletionCounts, eq(goalCompletionCounts.goalId, goalsCreatedUpToWeek.id))
        .toSQL();

    return {pendingGoals};
}
