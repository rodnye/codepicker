import { NextRequest, NextResponse } from 'next/server';
import { pickFiles } from 'codepicker-tool';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      patterns,
      absolute = false,
      lines,
      includeLineNumbers = false,
      includeDocs = false,
      gitignore = true,
      codeignore = true,
      dotIgnore = true,
      defaultPatterns = true,
      remote,
      remoteBranch,
    } = body;

    if (!patterns || !Array.isArray(patterns) || patterns.length === 0) {
      return NextResponse.json(
        { error: 'At least one pattern is required.' },
        { status: 400 },
      );
    }

    const output = await pickFiles({
      patterns,
      absolute,
      lines: lines ? parseInt(lines) : undefined,
      includeLineNumbers,
      includeDocs,
      gitignore,
      codeignore,
      dotIgnore,
      defaultPatterns,
      remote,
      remoteBranch,
    });

    const headers = new Headers();
    headers.set('Content-Type', 'text/plain');
    headers.set(
      'Content-Disposition',
      `attachment; filename="output-markdown.md"`,
    );

    return new NextResponse(Buffer.from(output), { status: 200, headers });
  } catch (error: any) {
    console.error('Pick API error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 },
    );
  }
}
