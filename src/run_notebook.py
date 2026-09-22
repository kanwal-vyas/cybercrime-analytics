import json
import sys
from pathlib import Path
import io
import contextlib
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt

def execute_notebook(notebook_path: str):
    path = Path(notebook_path)
    with open(path, 'r', encoding='utf-8') as f:
        nb = json.load(f)
        
    global_namespace = {
        '__name__': '__main__',
        'plt': plt
    }
    
    execution_count = 1
    total_cells = len(nb['cells'])
    code_cells = [c for c in nb['cells'] if c['cell_type'] == 'code']
    print(f"Executing {len(code_cells)} code cells in {path.name}...")
    
    for idx, cell in enumerate(nb['cells']):
        if cell['cell_type'] == 'code':
            source = "".join(cell['source'])
            
            # Setup custom display function to capture DataFrame displays
            captured_outputs = []
            
            def custom_display(*args, **kwargs):
                for arg in args:
                    if hasattr(arg, 'to_html'):
                        captured_outputs.append({
                            "data": {
                                "text/plain": [str(arg) + "\n"],
                                "text/html": [arg.to_html() + "\n"]
                            },
                            "metadata": {},
                            "output_type": "display_data"
                        })
                    else:
                        captured_outputs.append({
                            "data": {
                                "text/plain": [str(arg) + "\n"]
                            },
                            "metadata": {},
                            "output_type": "display_data"
                        })
                        
            global_namespace['display'] = custom_display
            
            stdout_buf = io.StringIO()
            stderr_buf = io.StringIO()
            
            try:
                with contextlib.redirect_stdout(stdout_buf), contextlib.redirect_stderr(stderr_buf):
                    exec(source, global_namespace)
            except Exception as e:
                print(f"ERROR in cell {idx + 1}:\n{source}\n\nException: {e}")
                raise
                
            stdout_text = stdout_buf.getvalue()
            stderr_text = stderr_buf.getvalue()
            
            cell_outputs = []
            if stdout_text:
                cell_outputs.append({
                    "name": "stdout",
                    "output_type": "stream",
                    "text": stdout_text.splitlines(keepends=True)
                })
            if stderr_text:
                cell_outputs.append({
                    "name": "stderr",
                    "output_type": "stream",
                    "text": stderr_text.splitlines(keepends=True)
                })
            cell_outputs.extend(captured_outputs)
            
            cell['execution_count'] = execution_count
            cell['outputs'] = cell_outputs
            execution_count += 1
            print(f"  Cell {execution_count - 1}/{len(code_cells)} executed successfully.")
            
    with open(path, 'w', encoding='utf-8') as f:
        json.dump(nb, f, indent=2)
        
    print(f"Successfully executed and saved {path.name}.")

if __name__ == '__main__':
    target = sys.argv[1] if len(sys.argv) > 1 else 'notebooks/04_association_rules.ipynb'
    execute_notebook(target)
