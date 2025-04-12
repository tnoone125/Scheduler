using Scheduler.Web.Models;

namespace Scheduler.Web.SchedulingCalc
{
    public class ExpressionConflctFinder
    {
        public static List<HashSet<int>> FindConflictGroups(List<Expression> expressions)
        {
            int n = expressions.Count;
            List<HashSet<int>> conflictGroups = new();
            bool[] visited = new bool[n];

            // Build adjacency list graph
            List<int>[] graph = new List<int>[n];
            for (int i = 0; i < n; i++) graph[i] = new List<int>();

            for (int i = 0; i < n; i++)
            {
                for (int j = i + 1; j < n; j++)
                {
                    if (Expression.ExpressionsClash(expressions[i], expressions[j]))
                    {
                        graph[i].Add(j);
                        graph[j].Add(i);
                    }
                }
            }

            void DFS(int index, HashSet<int> group)
            {
                if (visited[index]) return;
                visited[index] = true;
                group.Add(index);

                foreach (var neighbor in graph[index])
                {
                    DFS(neighbor, group);
                }
            }

            for (int i = 0; i < n; i++)
            {
                if (!visited[i])
                {
                    HashSet<int> group = new();
                    DFS(i, group);
                    conflictGroups.Add(group);
                }
            }

            return conflictGroups;
        }
    }
}
