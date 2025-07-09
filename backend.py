from flask import Flask, request, jsonify
from flask_cors import CORS
import subprocess
import json
import os
import tempfile
import sys
import traceback

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint to verify backend is running"""
    return jsonify({
        'status': 'healthy', 
        'service': 'AI Analysis Backend',
        'python_version': sys.version,
        'openai_configured': bool(os.getenv('OPENAI_API_KEY')),
        'ai_script_exists': os.path.exists('ai_analysis.py')
    })

@app.route('/api/analyze-section', methods=['POST'])
def analyze_single_section():
    """Analyze a single section using the Python AI script"""
    try:
        # Validate request
        if not request.is_json:
            return jsonify({'error': 'Request must be JSON'}), 400
            
        data = request.json
        if not data:
            return jsonify({'error': 'Empty request body'}), 400
            
        section_type = data.get('section_type')
        content = data.get('content')
        
        if not section_type or not content:
            return jsonify({'error': 'Missing section_type or content'}), 400
        
        print(f"Analyzing section: {section_type}")
        print(f"Content length: {len(content)} characters")
        
        # Check if AI script exists
        if not os.path.exists('ai_analysis.py'):
            return jsonify({'error': 'AI analysis script not found. Make sure ai_analysis.py is in the same directory.'}), 500
        
        # Check if OpenAI API key is set
        if not os.getenv('OPENAI_API_KEY'):
            return jsonify({'error': 'OpenAI API key not configured. Set OPENAI_API_KEY environment variable.'}), 500
            
        # Create temporary input for Python script
        temp_input = [{
            "type": section_type,
            "content": content
        }]
        
        # Create temporary file
        with tempfile.NamedTemporaryFile(mode='w', suffix='.json', delete=False) as f:
            json.dump(temp_input, f)
            temp_file = f.name
        
        try:
            print(f"Calling AI analysis script with temp file: {temp_file}")
            
            # Call Python AI analysis script
            result = subprocess.run([
                sys.executable, 'ai_analysis.py', temp_file
            ], capture_output=True, text=True, timeout=60, cwd=os.getcwd())
            
            print(f"AI script return code: {result.returncode}")
            print(f"AI script stdout: {result.stdout[:200]}...")
            if result.stderr:
                print(f"AI script stderr: {result.stderr}")
            
            if result.returncode == 0:
                try:
                    analysis = json.loads(result.stdout)
                    if 'results' in analysis and len(analysis['results']) > 0:
                        response_data = {
                            'summary': analysis['results'][0]['summary'],
                            'uniqueness_score': analysis['results'][0]['uniqueness_score']
                        }
                        print(f"Analysis completed for {section_type}: Score {response_data['uniqueness_score']}")
                        return jsonify(response_data)
                    else:
                        return jsonify({'error': 'Invalid analysis result format'}), 500
                except json.JSONDecodeError as e:
                    print(f"JSON decode error: {e}")
                    print(f"Raw stdout: {result.stdout}")
                    return jsonify({'error': f'Invalid JSON response from AI script: {str(e)}'}), 500
            else:
                error_msg = result.stderr or result.stdout or 'Unknown error in AI analysis script'
                print(f"AI script failed with error: {error_msg}")
                return jsonify({'error': f'AI analysis failed: {error_msg}'}), 500
                
        finally:
            # Clean up temporary file
            try:
                os.unlink(temp_file)
            except Exception as e:
                print(f"Failed to cleanup temp file: {e}")
            
    except subprocess.TimeoutExpired:
        print("AI analysis timeout")
        return jsonify({'error': 'Analysis timeout - please try again'}), 500
    except Exception as e:
        print(f"Unexpected error in analyze_single_section: {str(e)}")
        print(f"Traceback: {traceback.format_exc()}")
        return jsonify({'error': f'Server error: {str(e)}'}), 500

@app.route('/api/analyze-sections', methods=['POST'])
def analyze_multiple_sections():
    """Analyze multiple sections using the Python AI script"""
    try:
        if not request.is_json:
            return jsonify({'error': 'Request must be JSON'}), 400
            
        data = request.json
        if not data:
            return jsonify({'error': 'Empty request body'}), 400
            
        sections = data.get('sections', [])
        
        if not sections:
            return jsonify({'error': 'No sections provided'}), 400
        
        print(f"Analyzing {len(sections)} sections")
        
        # Check if AI script exists
        if not os.path.exists('ai_analysis.py'):
            return jsonify({'error': 'AI analysis script not found'}), 500
        
        # Check if OpenAI API key is set
        if not os.getenv('OPENAI_API_KEY'):
            return jsonify({'error': 'OpenAI API key not configured'}), 500
        
        # Create temporary file
        with tempfile.NamedTemporaryFile(mode='w', suffix='.json', delete=False) as f:
            json.dump(sections, f)
            temp_file = f.name
        
        try:
            # Call Python AI analysis script
            result = subprocess.run([
                sys.executable, 'ai_analysis.py', temp_file
            ], capture_output=True, text=True, timeout=120, cwd=os.getcwd())
            
            if result.returncode == 0:
                analysis = json.loads(result.stdout)
                print(f"Batch analysis completed: {analysis['total_sections']} sections")
                return jsonify(analysis)
            else:
                error_msg = result.stderr or result.stdout or 'Unknown error in AI analysis script'
                print(f"AI script error: {error_msg}")
                return jsonify({'error': f'Analysis failed: {error_msg}'}), 500
                
        finally:
            # Clean up temporary file
            try:
                os.unlink(temp_file)
            except Exception as e:
                print(f"Failed to cleanup temp file: {e}")
            
    except subprocess.TimeoutExpired:
        return jsonify({'error': 'Analysis timeout - please try again'}), 500
    except json.JSONDecodeError as e:
        return jsonify({'error': f'Invalid JSON response from AI script: {str(e)}'}), 500
    except Exception as e:
        print(f"Unexpected error in analyze_multiple_sections: {str(e)}")
        print(f"Traceback: {traceback.format_exc()}")
        return jsonify({'error': f'Server error: {str(e)}'}), 500

@app.route('/api/test', methods=['GET'])
def test_endpoint():
    """Test endpoint to verify API is working"""
    return jsonify({
        'message': 'Backend is working!',
        'endpoints': [
            '/api/health',
            '/api/analyze-section',
            '/api/analyze-sections',
            '/api/test'
        ],
        'environment': {
            'python_version': sys.version,
            'working_directory': os.getcwd(),
            'ai_script_exists': os.path.exists('ai_analysis.py'),
            'openai_key_set': bool(os.getenv('OPENAI_API_KEY'))
        }
    })

if __name__ == '__main__':
    print("=" * 50)
    print("AI Analysis Backend Starting...")
    print("=" * 50)
    
    # Check if ai_analysis.py exists
    if not os.path.exists('ai_analysis.py'):
        print("❌ WARNING: ai_analysis.py not found in current directory!")
        print("   Make sure ai_analysis.py is in the same directory as backend.py")
        print(f"   Current directory: {os.getcwd()}")
    else:
        print("✅ ai_analysis.py found")
    
    # Check if OpenAI API key is set
    if not os.getenv('OPENAI_API_KEY'):
        print("❌ WARNING: OPENAI_API_KEY environment variable not set!")
        print("   Set it with: export OPENAI_API_KEY=your_openai_api_key_here")
    else:
        print("✅ OpenAI API key configured")
    
    print(f"✅ Python version: {sys.version}")
    print(f"✅ Working directory: {os.getcwd()}")
    print("=" * 50)
    print("Backend will be available at: http://localhost:5000")
    print("Health check: http://localhost:5000/api/health")
    print("Test endpoint: http://localhost:5000/api/test")
    print("=" * 50)
    
    app.run(debug=True, port=5000, host='0.0.0.0')