import os

file_path = r"c:\Users\abd\Downloads\joker\tawq-fresh\workspace\shadcn-ui\src\pages\AIInsights.tsx"

old_content_snippet = """  useEffect(() => {
    // Load mock data
    const mockEmployees = [
      { id: '1', name: 'أحمد محمد', role: 'مدير', avatar: '', points: 850, totalEarnings: 12000 },
      { id: '2', name: 'فاطمة علي', role: 'موظف', avatar: '', points: 650, totalEarnings: 8500 },
      { id: '3', name: 'سارة أحمد', role: 'موظف', avatar: '', points: 420, totalEarnings: 5500 },
      { id: '4', name: 'محمد حسن', role: 'موظف', avatar: '', points: 780, totalEarnings: 9800 },
      { id: '5', name: 'نورة خالد', role: 'موظف', avatar: '', points: 320, totalEarnings: 4200 }
    ];
    
    const mockTasks = [
      { id: '1', assigneeId: '1', status: 'completed', priority: 'high', createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
      { id: '2', assigneeId: '2', status: 'pending', priority: 'medium', createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString() },
      { id: '3', assigneeId: '3', status: 'completed', priority: 'low', createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), dueDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString() },
      { id: '4', assigneeId: '1', status: 'completed', priority: 'high', createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() },
      { id: '5', assigneeId: '4', status: 'in-progress', priority: 'high', createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString() },
      { id: '6', assigneeId: '5', status: 'pending', priority: 'medium', createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(), dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() }
    ];
    
    setEmployees(mockEmployees);
    setTasks(mockTasks);
  }, []);"""

new_content_snippet = """  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [employeesData, tasksData] = await Promise.all([
        supabaseAPI.getEmployees(),
        supabaseAPI.getTasks()
      ]);
      setEmployees(employeesData || []);
      setTasks(tasksData || []);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };"""

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

if old_content_snippet in content:
    new_content = content.replace(old_content_snippet, new_content_snippet)
    with open(file_path, "w", encoding="utf-8") as f:
        f.write(new_content)
    print("File updated successfully")
else:
    print("Could not find the snippet to replace")
